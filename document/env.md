# Voyager Env 源代码拆解

9.16 李羿璇

## 逻辑概述（省流）

基本是起到了桥接器的作用，负责在 Voyager 的逻辑、Mineflayer 的环境与 MC 客户端之间做一个连接。整体 Python 一侧的环境基于 gym，Mineflayer 一侧的环境是一个基于 Express 的后端，Python 和 Mineflayer 之间通过 HTTP 来通信。

## 具体分析

VoyagerEnv 基于 OpenAI 的 gym：

```python
class VoyagerEnv(gym.Env)
```

因此要实现四个主要接口：

```python
class Env(Generic[ObsType, ActType]):
    def step(
        self, action: ActType
    ) -> tuple[ObsType, SupportsFloat, bool, bool, dict[str, Any]]:
        raise NotImplementedError
        
    def reset(
        self,
        *,
        seed: int | None = None,
        options: dict[str, Any] | None = None,
    ) -> tuple[ObsType, dict[str, Any]]:
        if seed is not None:
            self._np_random, seed = seeding.np_random(seed)
            
    def render(self) -> RenderFrame | list[RenderFrame] | None:
        raise NotImplementedError
        
    def close(self):
        pass
```

其中，`render` 接口没有实现：

```python
def render(self):
    raise NotImplementedError("render is not implemented")
```

然后来看其他几个接口的实现方式。

### `init`

大部分都是一些环境变量，比较有实际内容的是 `self.mineflayer` 和 `self.mc_instance`。

```python
self.mineflayer = self.get_mineflayer_process(server_port)
    if azure_login:
        self.mc_instance = self.get_mc_instance()
    else:
        self.mc_instance = None
```

#### `mineflayer`

本质上是一个叫 `SubprocessMonitor` 的类的对象。这个东西的功能一方面是打 log，另一方面是把 Mineflayer 跑起来。具体而言，是运行 `voyager/env/mineflayer/index.js`，目测是基于 `express` 的一套环境，总之基于这个就可以调各种技能、在 python 一侧获取 MC 的信息等，可以处理 `start`、`step` 等请求。这里有一段 copilot chat 生成的代码解释（不保证对）：

> 这段代码是一个名为 `index.js` 的 JavaScript 文件。它使用 `require` 函数导入了几个模块，包括 `fs`、`express`、`body-parser` 和 `mineflayer`。`fs` 模块用于文件系统操作，`express` 是 Node.js 的 Web 框架，`body-parser` 是用于解析 JSON 和 URL 编码数据的中间件，`mineflayer` 是 Minecraft 机器人 API。
>
> 代码还从 `./lib/observation` 和 `./lib/skillLoader` 目录导入了几个自定义模块。这些模块用于观察和交互 Minecraft 世界，以及加载机器人使用的技能。
>
> 在导入必要的模块之后，代码将 `bot` 变量初始化为 `null`，并创建了一个 `express` 应用程序实例。然后将 `body-parser` 中间件添加到应用程序中以处理传入的请求。
>
> 代码定义了一个处理 `/start` 的 `POST` 请求的路由。当调用此路由时，代码会检查是否已经存在 `bot` 实例，并在存在时将其断开连接。然后使用 `mineflayer.createBot` 函数创建一个新的 `bot` 实例，将 `host` 参数设置为 `"localhost"`。这将创建一个新的 Minecraft 机器人，连接到运行在与 Node.js 应用程序相同的计算机上的服务器。
>
> 最后，代码将请求正文记录到控制台并向客户端发送响应。

#### `mc_instance`

本质上和 `mineflayer` 部分没有区别，只是套了一层 Azure，考虑到我们大概率不会使用 Azure，此处不做过多赘述。

### `reset`

* 首先做了一些鲁棒性的处理，然后开始进行重置。

* 调用内部自己定义的函数 `unpause`，其大概功能是给 Mineflayer 的后端发一个 `pause` 请求来解除暂停，然后 Mineflayer 再调用之前给客户端打的 mod "Multi Server Pause" 来暂停 MC。

  ```python
  res = requests.post(f"{self.server}/pause")
  ```

  ```javascript
  bot.chat("/pause");
  ```

* 调用 `mineflayer.stop`：直接 `terminate` 掉 Mineflayer 侧的 process

* 通过调用内部定义的函数 `check_process` 来获取返回的数据。

  具体而言，这个 `check_process` 先起一个 Mineflayer（`mineflayer.run()`），然后给后端发 `start` 请求。`start` 的运行逻辑是调整背包初始物品、调一些 Mineflayer 的第三方包、设置一些命令之类的，正常来讲返回的是 Mineflayer 的 `bot` 的观察结果。

  ```javascript
  res.json(bot.observe());
  ```

* 最后做一些状态记录之后，把返回数据以 `json` 的形式再返回。

### `step`

* 首先依然 `check_process`（这次的主要目的应该就是单纯看后端是否在运行），然后调用 `unpause`

* 向后端发送 `step` 请求，其中包含了 `code`、`programs`（应该是来自于 Skill Library），比如我看到主程序有类似这样的调用：

  ```python
  new_events = self.env.step(
                  f"await givePlacedItemBack(bot, {U.json_dumps(blocks)}, {U.json_dumps(positions)})",
                  programs=self.skill_manager.programs,
              )
  ```

  目测后端对于 `step`  应该有卡住了 / 死循环了怎么处理的逻辑，但是好像并没有生效（也可能是我没有理解×）

  ```javascript
  function onStuck(posThreshold) {
      const currentPos = bot.entity.position;
      bot.stuckPosList.push(currentPos);
  
      // Check if the list is full
      if (bot.stuckPosList.length === 5) {
          const oldestPos = bot.stuckPosList[0];
          const posDifference = currentPos.distanceTo(oldestPos);
  
          if (posDifference < posThreshold) {
              teleportBot(); // execute the function
          }
  
          // Remove the oldest time from the list
          bot.stuckPosList.shift();
      }
  }
  ```

* 最后返回的应该还是一个观察到的结果。

### `close`

相对简单，直接 `unpause` -> 向后端发一个 `stop` 请求（可以关掉 `bot`）->调用 `mineflayer.stop()`（彻底关掉后端）即结束。

