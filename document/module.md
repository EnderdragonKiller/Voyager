# Voyager 四大模块逻辑源代码拆解

9.17 李羿璇



根据原始 Paper 我们知道，Voyager 主要有如下几个部分组成：

* Automatic Curriculum：主要是让 agent 去进行探索，生成现阶段的任务
* Skill Library：用于维护技能库
* Action：用于实际执行动作（原始 paper 中的 Iterative Prompting Mechanism）
* Critic：用于评价动作是否成功、分析问题等（原始 paper 中的 self-verification）

实际代码中，Voyager 的主体运行也是这四个成员，其余部分不本质（打 log 等）。基于这四个成员，作者同样实现了 `reset`、`close`、`step` 三个基本函数。此外，作者基于此设置了 `learn` 和 `inference` 两种模式。

## Agent

首先先来分析 Agent 中的各个部分：

### action

`action` 中有一些不特别本质的处理箱子部分；比较本质的有 `render_system_message`、`render_human_message`、`process_ai_message`、`summarize_chatlog` 这几个函数。

#### `render_system_message`

这个函数的根本作用是合成一个 prompt，要求 llm 写函数

* 首先加载 `action_template` 的 prompt（这个 prompt 大意是要求 llm 写函数）
* 然后加载传入的技能（根据主函数的调用，目测可能是技能库，也可能是刚学的新技能）
* 再加载 `response_format` 的 prompt（大概是教 llm 函数格式）
* 最后三部分通过字符串解析拼起来，返回一个 `langchain` 的 `SystemMessage`。

#### `render_human_message`

这个函数的根本作用是把一些环境信息、前一轮的代码、critic agent 给出的 critique 等一系列信息合成一个 prompt，实现细节略（不本质），最后返回一个 `langchain` 的 `HumanMessage`

#### `process_ai_message`

这个函数的作用主要是将 llm 返回的 `AIMessage` 中的函数解析，解析出的代码进行编译，若错误则返回异常，实现细节略，最后返回具体的错误

#### `summarize_chatlog`

这个函数的作用主要是将 `bot` 的发言解析。其中，`bot` 的发言格式在写函数的部分是设定好的，此处只需要对着之前的规定解析一下即可。此处代码用的是 `re` 进行正则匹配

### critic

主要功能是评判前一步的任务是否成功。

#### `render_system_message`

主要是调 `critic` 这个 prompt，没有什么本质内容，这个 prompt 的主要要求是基于 obs 和目标判断目标是否完成。

#### `render_human_message`

主要是在 prompt 中加入输入的所有观察信息，用于后续判断

#### `ai_check_task_success`

将上面两部分信息丢给 llm，让 llm 判断任务是否完成，并提出建议

#### `human_check_task_success`

还可以调成手动模式，自己肉眼判断（只给出 y/n 即可）

### curriculum

这部分有两个 llm，一个用于 qa，一个用于推理。同时，问题库的 vectordb 也是在这一部分做的。

#### `init`

* 建立 llm、qa_llm、vectordb：此处的 vectordb 基于 langchain 的 Chroma 模块，使用了 OpenAIEmbedding 来做 embedding。
* 定义一个 warm_up，主要是区分早期训练和后期训练
* 若是继续训练，还要加载之前的记录

#### `render_system_message`

主要是直接调 `curriculum` 这个 prompt，这个 prompt 的主要要求是基于现有的 obs 来生成一个目标，并给一个理由。

#### `render_human_message`

首先添加了所有 `observation` 的信息，若学会的技能比较多（超过了 warm_up 的阈值），还会额外通过 `run_qa` 问一些问题，其目的是增加 agent 的可扩展性。

#### `propose_next_task`

主要用于获取下一个目标

* 初始情况、自由探索的情况下，第一个目标默认为获取木头
* 在背包快满的时候，写了一个 hard code 来做箱子（大概是作者在训练的时候发现训不出来×）
* 通过调用 llm（具体的信息就是刚才两部分的 system 和 human）或者人手输入，获取下一个任务
* 在调用 llm 的情况下，还会调用 qa_llm 来查找如何完成这个目标

#### `decompose_task`

主要用于分解目标，用在了 `inference` 部分，基本就是直接调 llm 来分解

#### `run_qa`

* 首先要获取一个问题列表：
* 问题列表中，固定要获取当前群系（hard code），询问当前群系能发现的所有内容
* 在此之外，还会通过加载 `step1_ask_questions` 这个 prompt，来要求 qa_llm 提出一些富有好奇心的问题
* 整个问题列表的所有问题在 vectordb 中要和之前已有的问题算一个相似度，若已经有之前回答好的问题，就直接用以前的回答来代替
* 若是个新问题，就直接调 qa_llm 开始问（用的基础 prompt 是 `step2_answer_questions`），并把问题答案对记录下来
* 最后返回所有的问题和所有的答案

### skill

技能的 vectordb 是在这一部分做的，基本上有调用技能、维护技能两大功能。

#### 维护技能

基本上，在添加技能时要生成技能描述，方法就是直接调 gpt

#### 调用技能

vectordb 在这里发挥作用：对于一个 query，用 vectordb 算已有技能库的相似度，算好之后返回技能。