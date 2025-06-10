Skip to content
logo


Search
 
 GitHub
Guides
Reference
Examples
Resources
LangGraph
Graphs
Functional API
Pregel
Checkpointing
Storage
Caching
Types
Config
Errors
Constants
Channels
Prebuilt
Agents
Supervisor
Swarm
MCP Adapters
LangGraph Platform
Server API
CLI
SDK (Python)
SDK (JS/TS)
RemoteGraph
Environment variables
Table of contents
 AgentState
 create_react_agent
 ToolNode
 inject_tool_args
 InjectedState
 InjectedStore
 tools_condition
 ValidationNode
 HumanInterruptConfig
 ActionRequest
 HumanInterrupt
 HumanResponse
Agents¶
Classes:

Name	Description
AgentState	The state of the agent.
Functions:

Name	Description
create_react_agent	Creates an agent graph that calls tools in a loop until a stopping condition is met.
 AgentState ¶
Bases: TypedDict

The state of the agent.

 create_react_agent ¶

create_react_agent(
    model: Union[str, LanguageModelLike],
    tools: Union[
        Sequence[Union[BaseTool, Callable, dict[str, Any]]],
        ToolNode,
    ],
    *,
    prompt: Optional[Prompt] = None,
    response_format: Optional[
        Union[
            StructuredResponseSchema,
            tuple[str, StructuredResponseSchema],
        ]
    ] = None,
    pre_model_hook: Optional[RunnableLike] = None,
    post_model_hook: Optional[RunnableLike] = None,
    state_schema: Optional[StateSchemaType] = None,
    config_schema: Optional[Type[Any]] = None,
    checkpointer: Optional[Checkpointer] = None,
    store: Optional[BaseStore] = None,
    interrupt_before: Optional[list[str]] = None,
    interrupt_after: Optional[list[str]] = None,
    debug: bool = False,
    version: Literal["v1", "v2"] = "v2",
    name: Optional[str] = None
) -> CompiledGraph
Creates an agent graph that calls tools in a loop until a stopping condition is met.

For more details on using create_react_agent, visit Agents documentation.

Parameters:

Name	Type	Description	Default
model	Union[str, LanguageModelLike]	The LangChain chat model that supports tool calling.	required
tools	Union[Sequence[Union[BaseTool, Callable, dict[str, Any]]], ToolNode]	A list of tools or a ToolNode instance. If an empty list is provided, the agent will consist of a single LLM node without tool calling.	required
prompt	Optional[Prompt]	An optional prompt for the LLM. Can take a few different forms:
str: This is converted to a SystemMessage and added to the beginning of the list of messages in state["messages"].
SystemMessage: this is added to the beginning of the list of messages in state["messages"].
Callable: This function should take in full graph state and the output is then passed to the language model.
Runnable: This runnable should take in full graph state and the output is then passed to the language model.
None
response_format	Optional[Union[StructuredResponseSchema, tuple[str, StructuredResponseSchema]]]	An optional schema for the final agent output.
If provided, output will be formatted to match the given schema and returned in the 'structured_response' state key. If not provided, structured_response will not be present in the output state. Can be passed in as:


- an OpenAI function/tool schema,
- a JSON Schema,
- a TypedDict class,
- or a Pydantic class.
- a tuple (prompt, schema), where schema is one of the above.
    The prompt will be used together with the model that is being used to generate the structured response.
Important

response_format requires the model to support .with_structured_output

Note

The graph will make a separate call to the LLM to generate the structured response after the agent loop is finished. This is not the only strategy to get structured responses, see more options in this guide.

None
pre_model_hook	Optional[RunnableLike]	An optional node to add before the agent node (i.e., the node that calls the LLM). Useful for managing long message histories (e.g., message trimming, summarization, etc.). Pre-model hook must be a callable or a runnable that takes in current graph state and returns a state update in the form of

# At least one of `messages` or `llm_input_messages` MUST be provided
{
    # If provided, will UPDATE the `messages` in the state
    "messages": [RemoveMessage(id=REMOVE_ALL_MESSAGES), ...],
    # If provided, will be used as the input to the LLM,
    # and will NOT UPDATE `messages` in the state
    "llm_input_messages": [...],
    # Any other state keys that need to be propagated
    ...
}
Important

At least one of messages or llm_input_messages MUST be provided and will be used as an input to the agent node. The rest of the keys will be added to the graph state.

Warning

If you are returning messages in the pre-model hook, you should OVERWRITE the messages key by doing the following:


{
    "messages": [RemoveMessage(id=REMOVE_ALL_MESSAGES), *new_messages]
    ...
}
None
post_model_hook	Optional[RunnableLike]	An optional node to add after the agent node (i.e., the node that calls the LLM). Useful for implementing human-in-the-loop, guardrails, validation, or other post-processing. Post-model hook must be a callable or a runnable that takes in current graph state and returns a state update.
Note

Only available with version="v2".

None
state_schema	Optional[StateSchemaType]	An optional state schema that defines graph state. Must have messages and remaining_steps keys. Defaults to AgentState that defines those two keys.	None
config_schema	Optional[Type[Any]]	An optional schema for configuration. Use this to expose configurable parameters via agent.config_specs.	None
checkpointer	Optional[Checkpointer]	An optional checkpoint saver object. This is used for persisting the state of the graph (e.g., as chat memory) for a single thread (e.g., a single conversation).	None
store	Optional[BaseStore]	An optional store object. This is used for persisting data across multiple threads (e.g., multiple conversations / users).	None
interrupt_before	Optional[list[str]]	An optional list of node names to interrupt before. Should be one of the following: "agent", "tools". This is useful if you want to add a user confirmation or other interrupt before taking an action.	None
interrupt_after	Optional[list[str]]	An optional list of node names to interrupt after. Should be one of the following: "agent", "tools". This is useful if you want to return directly or run additional processing on an output.	None
debug	bool	A flag indicating whether to enable debug mode.	False
version	Literal['v1', 'v2']	Determines the version of the graph to create. Can be one of:
"v1": The tool node processes a single message. All tool calls in the message are executed in parallel within the tool node.
"v2": The tool node processes a tool call. Tool calls are distributed across multiple instances of the tool node using the Send API.
'v2'
name	Optional[str]	An optional name for the CompiledStateGraph. This name will be automatically used when adding ReAct agent graph to another graph as a subgraph node - particularly useful for building multi-agent systems.	None
Returns:

Type	Description
CompiledGraph	A compiled LangChain runnable that can be used for chat interactions.
The "agent" node calls the language model with the messages list (after applying the prompt). If the resulting AIMessage contains tool_calls, the graph will then call the "tools". The "tools" node executes the tools (1 tool per tool_call) and adds the responses to the messages list as ToolMessage objects. The agent node then calls the language model again. The process repeats until no more tool_calls are present in the response. The agent then returns the full list of messages as a dictionary containing the key "messages".

Tools
LLM
User
Tools
LLM
User
Prompt + LLM
loop
[while tool_calls present]
Initial input
Execute tools
ToolMessage for each tool_calls
Return final state
Example

from langgraph.prebuilt import create_react_agent

def check_weather(location: str) -> str:
    '''Return the weather forecast for the specified location.'''
    return f"It's always sunny in {location}"

graph = create_react_agent(
    "anthropic:claude-3-7-sonnet-latest",
    tools=[check_weather],
    prompt="You are a helpful assistant",
)
inputs = {"messages": [{"role": "user", "content": "what is the weather in sf"}]}
for chunk in graph.stream(inputs, stream_mode="updates"):
    print(chunk)
 ToolNode ¶
Bases: RunnableCallable

A node that runs the tools called in the last AIMessage.

It can be used either in StateGraph with a "messages" state key (or a custom key passed via ToolNode's 'messages_key'). If multiple tool calls are requested, they will be run in parallel. The output will be a list of ToolMessages, one for each tool call.

Tool calls can also be passed directly as a list of ToolCall dicts.

Parameters:

Name	Type	Description	Default
tools	Sequence[Union[BaseTool, Callable]]	A sequence of tools that can be invoked by the ToolNode.	required
name	str	The name of the ToolNode in the graph. Defaults to "tools".	'tools'
tags	Optional[list[str]]	Optional tags to associate with the node. Defaults to None.	None
handle_tool_errors	Union[bool, str, Callable[..., str], tuple[type[Exception], ...]]	How to handle tool errors raised by tools inside the node. Defaults to True. Must be one of the following:
True: all errors will be caught and a ToolMessage with a default error message (TOOL_CALL_ERROR_TEMPLATE) will be returned.
str: all errors will be caught and a ToolMessage with the string value of 'handle_tool_errors' will be returned.
tuple[type[Exception], ...]: exceptions in the tuple will be caught and a ToolMessage with a default error message (TOOL_CALL_ERROR_TEMPLATE) will be returned.
Callable[..., str]: exceptions from the signature of the callable will be caught and a ToolMessage with the string value of the result of the 'handle_tool_errors' callable will be returned.
False: none of the errors raised by the tools will be caught
True
messages_key	str	The state key in the input that contains the list of messages. The same key will be used for the output from the ToolNode. Defaults to "messages".	'messages'
The ToolNode is roughly analogous to:


tools_by_name = {tool.name: tool for tool in tools}
def tool_node(state: dict):
    result = []
    for tool_call in state["messages"][-1].tool_calls:
        tool = tools_by_name[tool_call["name"]]
        observation = tool.invoke(tool_call["args"])
        result.append(ToolMessage(content=observation, tool_call_id=tool_call["id"]))
    return {"messages": result}
Tool calls can also be passed directly to a ToolNode. This can be useful when using the Send API, e.g., in a conditional edge:


def example_conditional_edge(state: dict) -> List[Send]:
    tool_calls = state["messages"][-1].tool_calls
    # If tools rely on state or store variables (whose values are not generated
    # directly by a model), you can inject them into the tool calls.
    tool_calls = [
        tool_node.inject_tool_args(call, state, store)
        for call in last_message.tool_calls
    ]
    return [Send("tools", [tool_call]) for tool_call in tool_calls]
Important
The input state can be one of the following:
A dict with a messages key containing a list of messages.
A list of messages.
A list of tool calls.
If operating on a message list, the last message must be an AIMessage with tool_calls populated.
Methods:

Name	Description
inject_tool_args	Injects the state and store into the tool call.
 inject_tool_args ¶

inject_tool_args(
    tool_call: ToolCall,
    input: Union[
        list[AnyMessage], dict[str, Any], BaseModel
    ],
    store: Optional[BaseStore],
) -> ToolCall
Injects the state and store into the tool call.

Tool arguments with types annotated as InjectedState and InjectedStore are ignored in tool schemas for generation purposes. This method injects them into tool calls for tool invocation.

Parameters:

Name	Type	Description	Default
tool_call	ToolCall	The tool call to inject state and store into.	required
input	Union[list[AnyMessage], dict[str, Any], BaseModel]	The input state to inject.	required
store	Optional[BaseStore]	The store to inject.	required
Returns:

Name	Type	Description
ToolCall	ToolCall	The tool call with injected state and store.
Classes:

Name	Description
InjectedState	Annotation for a Tool arg that is meant to be populated with the graph state.
InjectedStore	Annotation for a Tool arg that is meant to be populated with LangGraph store.
Functions:

Name	Description
tools_condition	Use in the conditional_edge to route to the ToolNode if the last message
 InjectedState ¶
Bases: InjectedToolArg

Annotation for a Tool arg that is meant to be populated with the graph state.

Any Tool argument annotated with InjectedState will be hidden from a tool-calling model, so that the model doesn't attempt to generate the argument. If using ToolNode, the appropriate graph state field will be automatically injected into the model-generated tool args.

Parameters:

Name	Type	Description	Default
field	Optional[str]	The key from state to insert. If None, the entire state is expected to be passed in.	None
Example

from typing import List
from typing_extensions import Annotated, TypedDict

from langchain_core.messages import BaseMessage, AIMessage
from langchain_core.tools import tool

from langgraph.prebuilt import InjectedState, ToolNode


class AgentState(TypedDict):
    messages: List[BaseMessage]
    foo: str

@tool
def state_tool(x: int, state: Annotated[dict, InjectedState]) -> str:
    '''Do something with state.'''
    if len(state["messages"]) > 2:
        return state["foo"] + str(x)
    else:
        return "not enough messages"

@tool
def foo_tool(x: int, foo: Annotated[str, InjectedState("foo")]) -> str:
    '''Do something else with state.'''
    return foo + str(x + 1)

node = ToolNode([state_tool, foo_tool])

tool_call1 = {"name": "state_tool", "args": {"x": 1}, "id": "1", "type": "tool_call"}
tool_call2 = {"name": "foo_tool", "args": {"x": 1}, "id": "2", "type": "tool_call"}
state = {
    "messages": [AIMessage("", tool_calls=[tool_call1, tool_call2])],
    "foo": "bar",
}
node.invoke(state)

[
    ToolMessage(content='not enough messages', name='state_tool', tool_call_id='1'),
    ToolMessage(content='bar2', name='foo_tool', tool_call_id='2')
]
 InjectedStore ¶
Bases: InjectedToolArg

Annotation for a Tool arg that is meant to be populated with LangGraph store.

Any Tool argument annotated with InjectedStore will be hidden from a tool-calling model, so that the model doesn't attempt to generate the argument. If using ToolNode, the appropriate store field will be automatically injected into the model-generated tool args. Note: if a graph is compiled with a store object, the store will be automatically propagated to the tools with InjectedStore args when using ToolNode.

Warning

InjectedStore annotation requires langchain-core >= 0.3.8

Example

from typing import Any
from typing_extensions import Annotated

from langchain_core.messages import AIMessage
from langchain_core.tools import tool

from langgraph.store.memory import InMemoryStore
from langgraph.prebuilt import InjectedStore, ToolNode

store = InMemoryStore()
store.put(("values",), "foo", {"bar": 2})

@tool
def store_tool(x: int, my_store: Annotated[Any, InjectedStore()]) -> str:
    '''Do something with store.'''
    stored_value = my_store.get(("values",), "foo").value["bar"]
    return stored_value + x

node = ToolNode([store_tool])

tool_call = {"name": "store_tool", "args": {"x": 1}, "id": "1", "type": "tool_call"}
state = {
    "messages": [AIMessage("", tool_calls=[tool_call])],
}

node.invoke(state, store=store)

{
    "messages": [
        ToolMessage(content='3', name='store_tool', tool_call_id='1'),
    ]
}
 tools_condition ¶

tools_condition(
    state: Union[
        list[AnyMessage], dict[str, Any], BaseModel
    ],
    messages_key: str = "messages",
) -> Literal["tools", "__end__"]
Use in the conditional_edge to route to the ToolNode if the last message

has tool calls. Otherwise, route to the end.

Parameters:

Name	Type	Description	Default
state	Union[list[AnyMessage], dict[str, Any], BaseModel]	The state to check for tool calls. Must have a list of messages (MessageGraph) or have the "messages" key (StateGraph).	required
Returns:

Type	Description
Literal['tools', '__end__']	The next node to route to.
Examples:

Create a custom ReAct-style agent with tools.


>>> from langchain_anthropic import ChatAnthropic
>>> from langchain_core.tools import tool
...
>>> from langgraph.graph import StateGraph
>>> from langgraph.prebuilt import ToolNode, tools_condition
>>> from langgraph.graph.message import add_messages
...
>>> from typing import Annotated
>>> from typing_extensions import TypedDict
...
>>> @tool
>>> def divide(a: float, b: float) -> int:
...     """Return a / b."""
...     return a / b
...
>>> llm = ChatAnthropic(model="claude-3-haiku-20240307")
>>> tools = [divide]
...
>>> class State(TypedDict):
...     messages: Annotated[list, add_messages]
>>>
>>> graph_builder = StateGraph(State)
>>> graph_builder.add_node("tools", ToolNode(tools))
>>> graph_builder.add_node("chatbot", lambda state: {"messages":llm.bind_tools(tools).invoke(state['messages'])})
>>> graph_builder.add_edge("tools", "chatbot")
>>> graph_builder.add_conditional_edges(
...     "chatbot", tools_condition
... )
>>> graph_builder.set_entry_point("chatbot")
>>> graph = graph_builder.compile()
>>> graph.invoke({"messages": {"role": "user", "content": "What's 329993 divided by 13662?"}})
 ValidationNode ¶
Bases: RunnableCallable

A node that validates all tools requests from the last AIMessage.

It can be used either in StateGraph with a "messages" key or in MessageGraph.

Note

This node does not actually run the tools, it only validates the tool calls, which is useful for extraction and other use cases where you need to generate structured output that conforms to a complex schema without losing the original messages and tool IDs (for use in multi-turn conversations).

Parameters:

Name	Type	Description	Default
schemas	Sequence[Union[BaseTool, Type[BaseModel], Callable]]	A list of schemas to validate the tool calls with. These can be any of the following: - A pydantic BaseModel class - A BaseTool instance (the args_schema will be used) - A function (a schema will be created from the function signature)	required
format_error	Optional[Callable[[BaseException, ToolCall, Type[BaseModel]], str]]	A function that takes an exception, a ToolCall, and a schema and returns a formatted error string. By default, it returns the exception repr and a message to respond after fixing validation errors.	None
name	str	The name of the node.	'validation'
tags	Optional[list[str]]	A list of tags to add to the node.	None
Returns:

Type	Description
Union[Dict[str, List[ToolMessage]], Sequence[ToolMessage]]	A list of ToolMessages with the validated content or error messages.
Example
Example usage for re-prompting the model to generate a valid response:

from typing import Literal, Annotated
from typing_extensions import TypedDict

from langchain_anthropic import ChatAnthropic
from pydantic import BaseModel, field_validator

from langgraph.graph import END, START, StateGraph
from langgraph.prebuilt import ValidationNode
from langgraph.graph.message import add_messages

class SelectNumber(BaseModel):
    a: int

    @field_validator("a")
    def a_must_be_meaningful(cls, v):
        if v != 37:
            raise ValueError("Only 37 is allowed")
        return v

builder = StateGraph(Annotated[list, add_messages])
llm = ChatAnthropic(model="claude-3-5-haiku-latest").bind_tools([SelectNumber])
builder.add_node("model", llm)
builder.add_node("validation", ValidationNode([SelectNumber]))
builder.add_edge(START, "model")

def should_validate(state: list) -> Literal["validation", "__end__"]:
    if state[-1].tool_calls:
        return "validation"
    return END

builder.add_conditional_edges("model", should_validate)

def should_reprompt(state: list) -> Literal["model", "__end__"]:
    for msg in state[::-1]:
        # None of the tool calls were errors
        if msg.type == "ai":
            return END
        if msg.additional_kwargs.get("is_error"):
            return "model"
    return END

builder.add_conditional_edges("validation", should_reprompt)

graph = builder.compile()
res = graph.invoke(("user", "Select a number, any number"))
# Show the retry logic
for msg in res:
    msg.pretty_print()
Classes:

Name	Description
HumanInterruptConfig	Configuration that defines what actions are allowed for a human interrupt.
ActionRequest	Represents a request for human action within the graph execution.
HumanInterrupt	Represents an interrupt triggered by the graph that requires human intervention.
HumanResponse	The response provided by a human to an interrupt, which is returned when graph execution resumes.
 HumanInterruptConfig ¶
Bases: TypedDict

Configuration that defines what actions are allowed for a human interrupt.

This controls the available interaction options when the graph is paused for human input.

Attributes:

Name	Type	Description
allow_ignore	bool	Whether the human can choose to ignore/skip the current step
allow_respond	bool	Whether the human can provide a text response/feedback
allow_edit	bool	Whether the human can edit the provided content/state
allow_accept	bool	Whether the human can accept/approve the current state
 ActionRequest ¶
Bases: TypedDict

Represents a request for human action within the graph execution.

Contains the action type and any associated arguments needed for the action.

Attributes:

Name	Type	Description
action	str	The type or name of action being requested (e.g., "Approve XYZ action")
args	dict	Key-value pairs of arguments needed for the action
 HumanInterrupt ¶
Bases: TypedDict

Represents an interrupt triggered by the graph that requires human intervention.

This is passed to the interrupt function when execution is paused for human input.

Attributes:

Name	Type	Description
action_request	ActionRequest	The specific action being requested from the human
config	HumanInterruptConfig	Configuration defining what actions are allowed
description	Optional[str]	Optional detailed description of what input is needed
Example

# Extract a tool call from the state and create an interrupt request
request = HumanInterrupt(
    action_request=ActionRequest(
        action="run_command",  # The action being requested
        args={"command": "ls", "args": ["-l"]}  # Arguments for the action
    ),
    config=HumanInterruptConfig(
        allow_ignore=True,    # Allow skipping this step
        allow_respond=True,   # Allow text feedback
        allow_edit=False,     # Don't allow editing
        allow_accept=True     # Allow direct acceptance
    ),
    description="Please review the command before execution"
)
# Send the interrupt request and get the response
response = interrupt([request])[0]
 HumanResponse ¶
Bases: TypedDict

The response provided by a human to an interrupt, which is returned when graph execution resumes.

Attributes:

Name	Type	Description
type	Literal['accept', 'ignore', 'response', 'edit']	The type of response: - "accept": Approves the current state without changes - "ignore": Skips/ignores the current step - "response": Provides text feedback or instructions - "edit": Modifies the current state/content
arg	Literal['accept', 'ignore', 'response', 'edit']	The response payload: - None: For ignore/accept actions - str: For text responses - ActionRequest: For edit actions with updated content
 Skip to content
logo


Search
 
 GitHub
Guides
Reference
Examples
Resources
LangGraph
Graphs
Functional API
Pregel
Checkpointing
Storage
Caching
Types
Config
Errors
Constants
Channels
Prebuilt
Agents
Supervisor
Swarm
MCP Adapters
LangGraph Platform
Server API
CLI
SDK (Python)
SDK (JS/TS)
RemoteGraph
Environment variables
Table of contents
 create_supervisor
 create_handoff_tool
 create_forward_message_tool
LangGraph Supervisor¶
Functions:

Name	Description
create_supervisor	Create a multi-agent supervisor.
 create_supervisor ¶

create_supervisor(
    agents: list[Pregel],
    *,
    model: LanguageModelLike,
    tools: (
        list[BaseTool | Callable] | ToolNode | None
    ) = None,
    prompt: Prompt | None = None,
    response_format: Optional[
        Union[
            StructuredResponseSchema,
            tuple[str, StructuredResponseSchema],
        ]
    ] = None,
    parallel_tool_calls: bool = False,
    state_schema: StateSchemaType = AgentState,
    config_schema: Type[Any] | None = None,
    output_mode: OutputMode = "last_message",
    add_handoff_messages: bool = True,
    handoff_tool_prefix: Optional[str] = None,
    add_handoff_back_messages: Optional[bool] = None,
    supervisor_name: str = "supervisor",
    include_agent_name: AgentNameMode | None = None
) -> StateGraph
Create a multi-agent supervisor.

Parameters:

Name	Type	Description	Default
agents	list[Pregel]	List of agents to manage. An agent can be a LangGraph CompiledStateGraph, a functional API workflow, or any other Pregel object.	required
model	LanguageModelLike	Language model to use for the supervisor	required
tools	list[BaseTool | Callable] | ToolNode | None	Tools to use for the supervisor	None
prompt	Prompt | None	Optional prompt to use for the supervisor. Can be one of:
str: This is converted to a SystemMessage and added to the beginning of the list of messages in state["messages"].
SystemMessage: this is added to the beginning of the list of messages in state["messages"].
Callable: This function should take in full graph state and the output is then passed to the language model.
Runnable: This runnable should take in full graph state and the output is then passed to the language model.
None
response_format	Optional[Union[StructuredResponseSchema, tuple[str, StructuredResponseSchema]]]	An optional schema for the final supervisor output.
If provided, output will be formatted to match the given schema and returned in the 'structured_response' state key. If not provided, structured_response will not be present in the output state. Can be passed in as:


- an OpenAI function/tool schema,
- a JSON Schema,
- a TypedDict class,
- or a Pydantic class.
- a tuple (prompt, schema), where schema is one of the above.
    The prompt will be used together with the model that is being used to generate the structured response.
Important

response_format requires the model to support .with_structured_output

Note

response_format requires structured_response key in your state schema. You can use the prebuilt langgraph.prebuilt.chat_agent_executor.AgentStateWithStructuredResponse.

None
parallel_tool_calls	bool	Whether to allow the supervisor LLM to call tools in parallel (only OpenAI and Anthropic). Use this to control whether the supervisor can hand off to multiple agents at once. If True, will enable parallel tool calls. If False, will disable parallel tool calls (default).
Important

This is currently supported only by OpenAI and Anthropic models. To control parallel tool calling for other providers, add explicit instructions for tool use to the system prompt.

False
state_schema	StateSchemaType	State schema to use for the supervisor graph.	AgentState
config_schema	Type[Any] | None	An optional schema for configuration. Use this to expose configurable parameters via supervisor.config_specs.	None
output_mode	OutputMode	Mode for adding managed agents' outputs to the message history in the multi-agent workflow. Can be one of:
full_history: add the entire agent message history
last_message: add only the last message (default)
'last_message'
add_handoff_messages	bool	Whether to add a pair of (AIMessage, ToolMessage) to the message history when a handoff occurs.	True
handoff_tool_prefix	Optional[str]	Optional prefix for the handoff tools (e.g., "delegate_to_" or "transfer_to_") If provided, the handoff tools will be named handoff_tool_prefix_agent_name. If not provided, the handoff tools will be named transfer_to_agent_name.	None
add_handoff_back_messages	Optional[bool]	Whether to add a pair of (AIMessage, ToolMessage) to the message history when returning control to the supervisor to indicate that a handoff has occurred.	None
supervisor_name	str	Name of the supervisor node.	'supervisor'
include_agent_name	AgentNameMode | None	Use to specify how to expose the agent name to the underlying supervisor LLM.
None: Relies on the LLM provider using the name attribute on the AI message. Currently, only OpenAI supports this.
"inline": Add the agent name directly into the content field of the AI message using XML-style tags. Example: "How can I help you" -> "<name>agent_name</name><content>How can I help you?</content>"
None
Example

from langchain_openai import ChatOpenAI

from langgraph_supervisor import create_supervisor
from langgraph.prebuilt import create_react_agent

# Create specialized agents

def add(a: float, b: float) -> float:
    '''Add two numbers.'''
    return a + b

def web_search(query: str) -> str:
    '''Search the web for information.'''
    return 'Here are the headcounts for each of the FAANG companies in 2024...'

math_agent = create_react_agent(
    model="openai:gpt-4o",
    tools=[add],
    name="math_expert",
)

research_agent = create_react_agent(
    model="openai:gpt-4o",
    tools=[web_search],
    name="research_expert",
)

# Create supervisor workflow
workflow = create_supervisor(
    [research_agent, math_agent],
    model=ChatOpenAI(model="gpt-4o"),
)

# Compile and run
app = workflow.compile()
result = app.invoke({
    "messages": [
        {
            "role": "user",
            "content": "what's the combined headcount of the FAANG companies in 2024?"
        }
    ]
})
Functions:

Name	Description
create_handoff_tool	Create a tool that can handoff control to the requested agent.
create_forward_message_tool	Create a tool the supervisor can use to forward a worker message by name.
 create_handoff_tool ¶

create_handoff_tool(
    *,
    agent_name: str,
    name: str | None = None,
    description: str | None = None,
    add_handoff_messages: bool = True
) -> BaseTool
Create a tool that can handoff control to the requested agent.

Parameters:

Name	Type	Description	Default
agent_name	str	The name of the agent to handoff control to, i.e. the name of the agent node in the multi-agent graph. Agent names should be simple, clear and unique, preferably in snake_case, although you are only limited to the names accepted by LangGraph nodes as well as the tool names accepted by LLM providers (the tool name will look like this: transfer_to_<agent_name>).	required
name	str | None	Optional name of the tool to use for the handoff. If not provided, the tool name will be transfer_to_<agent_name>.	None
description	str | None	Optional description for the handoff tool. If not provided, the description will be Ask agent <agent_name> for help.	None
add_handoff_messages	bool	Whether to add handoff messages to the message history. If False, the handoff messages will be omitted from the message history.	True
 create_forward_message_tool ¶

create_forward_message_tool(
    supervisor_name: str = "supervisor",
) -> BaseTool
Create a tool the supervisor can use to forward a worker message by name.

This helps avoid information loss any time the supervisor rewrites a worker query to the user and also can save some tokens.

Parameters:

Name	Type	Description	Default
supervisor_name	str	The name of the supervisor node (used for namespacing the tool).	'supervisor'
Returns:

Name	Type	Description
BaseTool	BaseTool	The 'forward_message' tool.
 Back to top
Previous
Agents
Next
Swarm
Copyright © 2025 LangChain, Inc | Consent Preferences
Made with Material for MkDocs
@backend 

Docker + GenAI: Complete Guide to Deploying AI Applications
📌 Summary
This tutorial demonstrates how to containerize and deploy Generative AI applications using Docker. You'll learn to use the Docker GenAI Stack (a collaboration between Docker, Neo4j, LangChain, and Ollama) to deploy AI applications with minimal configuration. The video covers both using pre-built stacks and creating your own containerized GenAI applications from scratch, including features like PDF chat bots, support bots, and Stack Overflow loaders.

🛠️ Prerequisites
Required Software
Docker Desktop (Mac, Windows, or Linux)
Git for repository cloning
Python 3.x (for custom applications)
Ollama (for local LLM management)
VS Code or preferred code editor
Required Accounts
Docker Hub account (optional but recommended)
GitHub account (for cloning repositories)
Hardware Requirements
Minimum 8GB RAM (16GB+ recommended)
10GB+ free disk space (for models and containers)
GPU support (optional but recommended for production)
🚀 Setup Instructions
Step 1: Install Docker Desktop
Visit Docker Desktop
Download the appropriate version for your OS
Install and launch Docker Desktop
Ensure Docker engine is running
Step 2: Install Ollama
Visit Ollama website
Download and install Ollama for your OS
Open terminal and pull a model:

Copy code
bash
ollama pull llama2
Step 3: Clone the GenAI Stack Repository

Copy code
bash
git clone https://github.com/docker/genai-stack.git
cd genai-stack
Step 4: Configure Environment Variables
Copy the example environment file:

Copy code
bash
cp .env.example .env
Edit the .env file with your preferred settings
Step 5: Launch the GenAI Stack

Copy code
bash
docker compose up
📋 Code Walkthrough
Part 1: Using the Pre-built GenAI Stack
Docker Compose Configuration
The GenAI stack uses a docker-compose.yml file that defines multiple services:


Copy code
yaml
version: '3.8'
services:
  ollama:
    image: ollama/ollama
    ports:
      - "11434:11434"
    volumes:
      - ollama:/root/.ollama
    
  neo4j:
    image: neo4j:latest
    ports:
      - "7474:7474"
      - "7687:7687"
    environment:
      - NEO4J_AUTH=neo4j/password
    
  bot:
    build: .
    ports:
      - "8501:8501"
    depends_on:
      - neo4j
      - ollama
Profile Configuration for Different Environments

Copy code
yaml
profiles:
  - linux
  - linux-gpu

services:
  ollama:
    profiles: ["linux"]
    # CPU configuration
    
  ollama-gpu:
    profiles: ["linux-gpu"]
    # GPU configuration with NVIDIA runtime
Part 2: Creating a Custom GenAI Application
Initialize Docker Configuration
Use Docker's init command to automatically generate Docker files:


Copy code
bash
docker init
This creates:

Dockerfile
docker-compose.yml
.dockerignore
README.Docker.md
Sample Dockerfile for Python GenAI App

Copy code
dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8501

CMD ["streamlit", "run", "app.py", "--server.address=0.0.0.0"]
Docker Compose for Custom App

Copy code
yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "8501:8501"
    environment:
      - NEO4J_URI=bolt://neo4j:7687
      - NEO4J_USERNAME=neo4j
      - NEO4J_PASSWORD=password
      - OLLAMA_BASE_URL=http://host.docker.internal:11434
    depends_on:
      neo4j:
        condition: service_healthy
    develop:
      watch:
        - action: rebuild
          path: .
          
  neo4j:
    image: neo4j:latest
    ports:
      - "7474:7474"
      - "7687:7687"
    environment:
      - NEO4J_AUTH=neo4j/password
    healthcheck:
      test: ["CMD", "cypher-shell", "-u", "neo4j", "-p", "password", "RETURN 1"]
      interval: 30s
      timeout: 10s
      retries: 5
Part 3: Development Features
Watch Mode for Live Reloading

Copy code
yaml
develop:
  watch:
    - action: rebuild
      path: ./src
    - action: sync
      path: ./static
      target: /app/static
Run with watch mode:


Copy code
bash
docker compose watch
Profile-based Deployment

Copy code
bash
# For CPU deployment
docker compose up

# For GPU deployment
docker compose --profile linux-gpu up
🧠 Key Concepts & Insights
Docker Containerization Benefits
Consistency: Same environment across development, testing, and production
Isolation: Dependencies are contained and don't conflict
Scalability: Easy to scale services independently
Portability: Run anywhere Docker is supported
GenAI Stack Components
Ollama: Local LLM management and serving
Neo4j: Graph database for knowledge storage and retrieval
LangChain: LLM orchestration and chaining
Streamlit: Web UI framework for Python apps
Docker Profiles
Allow different configurations for different environments
Useful for CPU vs GPU deployments
Avoid code duplication in compose files
Docker Watch Feature
Automatically rebuilds containers when files change
Improves development workflow
Supports different actions: rebuild, sync, restart
Container Health Checks
Ensure services are ready before dependent services start
Critical for database connections
Improves reliability of multi-service applications
⚠️ Common Errors & Fixes
Issue: Ollama Connection Failed
Error: Connection refused to localhost:11434

Fix:

Ensure Ollama is running on host machine
Use host.docker.internal:11434 instead of localhost:11434 in container
On Linux, use --network host or configure proper networking
Issue: Neo4j Authentication Failed
Error: Authentication failure

Fix:

Check environment variables match in both services
Wait for Neo4j to be fully initialized (use health checks)
Verify password complexity requirements
Issue: GPU Not Detected in Container
Error: CUDA/GPU not available in container

Fix:

Install NVIDIA Container Toolkit
Use --gpus all flag or configure in compose file
Use appropriate base images with CUDA support
Issue: Windows WSL Compatibility
Error: Various networking and file system issues

Fix:

Enable WSL integration in Docker Desktop
Run commands from within WSL environment
Use WSL-compatible file paths
🌱 What You Can Build Next
1. Multi-Modal AI Assistant
Extend the basic chat application to handle:

Image analysis and description
Audio transcription and processing
Document analysis beyond PDFs
Integration with external APIs
2. Enterprise Knowledge Base
Build a comprehensive knowledge management system:

Multiple document format support
User authentication and authorization
Advanced search and filtering
Analytics and usage tracking
3. AI-Powered Development Tools
Create developer-focused applications:

Code review and suggestion bot
Documentation generator
Bug report analyzer
Performance optimization advisor
🧾 Resources & Links
Official Documentation
Docker GenAI Stack Repository
Docker Compose Documentation
Docker Init Command
Tools and Frameworks
Ollama - Local LLM management
Neo4j - Graph database
LangChain - LLM orchestration
Streamlit - Python web apps
Additional Resources
Docker Desktop
NVIDIA Container Toolkit
WSL Docker Integration Guide
Docker Scout Security Scanning
Sample Applications
The GenAI stack includes several example applications:

Support Bot: Customer service automation
Stack Overflow Loader: Technical Q&A system
PDF Reader: Document analysis and chat
Knowledge Graph Explorer: Visual data exploration

Generate audio

Copy

Retry
great i added a new video do the same

Building Effective Agents with LangGraph: Complete Tutorial Guide
📌 Summary
This comprehensive tutorial by Lance from LangChain demonstrates how to build various AI workflows and agents using LangGraph. You'll learn the fundamental differences between workflows (predefined code paths with LLM calls) and agents (LLM-directed actions without scaffolding), and implement 7 different patterns from scratch: augmented LLMs, prompt chaining, parallelization, routing, orchestrator-worker, evaluator-optimizer, and reactive agents. Each pattern is built step-by-step with practical examples.

🛠️ Prerequisites
Required Software
Python 3.8+
Jupyter Notebook or VS Code with Python extension
Git for repository management
Required Python Packages

Copy code
bash
pip install langgraph langchain langchain-anthropic pydantic
Required Accounts
Anthropic API key (for Claude models)
OpenAI API key (optional, for GPT models)
Knowledge Prerequisites
Basic Python programming
Understanding of LLMs and API calls
Familiarity with JSON and data structures
Basic understanding of AI/ML concepts
🚀 Setup Instructions
Step 1: Environment Setup
Create a new Python virtual environment:

Copy code
bash
python -m venv langgraph-env
source langgraph-env/bin/activate 
Install required packages:

Copy code
bash
pip install langgraph langchain langchain-anthropic pydantic jupyter
Step 2: API Configuration
Set up your API keys as environment variables:

Copy code
bash
export ANTHROPIC_API_KEY="your-anthropic-api-key"
export OPENAI_API_KEY="your-openai-api-key"  # Optional
Or create a .env file:

Copy code
markdown
ANTHROPIC_API_KEY=your-anthropic-api-key
OPENAI_API_KEY=your-openai-api-key
Step 3: Initialize Your Notebook
Create a new Jupyter notebook and start with basic imports:


Copy code
python
import os
from langgraph.graph import StateGraph, END
from langchain_anthropic import ChatAnthropic
from pydantic import BaseModel
from typing import TypedDict, List
📋 Code Walkthrough
Part 1: Augmented LLMs Foundation
Setting Up the Base LLM

Copy code
python
# Initialize the LLM
llm = ChatAnthropic(model="claude-3-sonnet-20240229", temperature=0)

# Example of structured output
class JokeSchema(BaseModel):
    setup: str
    punchline: str

# Bind structured output to LLM
structured_llm = llm.with_structured_output(JokeSchema)

# Test structured output
result = structured_llm.invoke("Tell me a joke about programming")
print(f"Setup: {result.setup}")
print(f"Punchline: {result.punchline}")
Tool Calling Setup

Copy code
python
def multiply(a: int, b: int) -> int:
    """Multiply two numbers together."""
    return a * b

# Bind tools to LLM
tools = [multiply]
llm_with_tools = llm.bind_tools(tools)

# Test tool calling
response = llm_with_tools.invoke("What is 15 multiplied by 7?")
print(response.tool_calls)
Part 2: Prompt Chaining Workflow
State Definition

Copy code
python
class ChainState(TypedDict):
    topic: str
    joke: str
    improved_joke: str
    final_joke: str
Workflow Functions

Copy code
python
def generate_joke(state: ChainState):
    """Generate initial joke"""
    topic = state["topic"]
    response = llm.invoke(f"Write a joke about {topic}")
    return {"joke": response.content}

def improve_joke(state: ChainState):
    """Improve the joke"""
    joke = state["joke"]
    response = llm.invoke(f"Improve this joke: {joke}")
    return {"improved_joke": response.content}

def polish_joke(state: ChainState):
    """Final polish of the joke"""
    improved_joke = state["improved_joke"]
    response = llm.invoke(f"Polish and finalize this joke: {improved_joke}")
    return {"final_joke": response.content}

def check_punchline(state: ChainState) -> str:
    """Check if joke has a proper punchline"""
    joke = state["joke"]
    if "?" in joke or "!" in joke:
        return "pass"
    return "fail"
Building the Chain Graph

Copy code
python
# Create the workflow
workflow = StateGraph(ChainState)

# Add nodes
workflow.add_node("generate_joke", generate_joke)
workflow.add_node("improve_joke", improve_joke)
workflow.add_node("polish_joke", polish_joke)

# Add edges
workflow.set_entry_point("generate_joke")
workflow.add_conditional_edges(
    "generate_joke",
    check_punchline,
    {
        "pass": "improve_joke",
        "fail": END
    }
)
workflow.add_edge("improve_joke", "polish_joke")
workflow.add_edge("polish_joke", END)

# Compile the graph
chain = workflow.compile()

# Test the chain
result = chain.invoke({"topic": "programming"})
print(result["final_joke"])
Part 3: Parallelization Workflow
Parallel State Definition

Copy code
python
class ParallelState(TypedDict):
    topic: str
    joke: str
    story: str
    poem: str
    combined_output: str
Parallel Functions

Copy code
python
def write_joke(state: ParallelState):
    """Write a joke about the topic"""
    topic = state["topic"]
    response = llm.invoke(f"Write a short joke about {topic}")
    return {"joke": response.content}

def write_story(state: ParallelState):
    """Write a story about the topic"""
    topic = state["topic"]
    response = llm.invoke(f"Write a short story about {topic}")
    return {"story": response.content}

def write_poem(state: ParallelState):
    """Write a poem about the topic"""
    topic = state["topic"]
    response = llm.invoke(f"Write a short poem about {topic}")
    return {"poem": response.content}

def aggregate_content(state: ParallelState):
    """Combine all content"""
    combined = f"JOKE:\n{state['joke']}\n\nSTORY:\n{state['story']}\n\nPOEM:\n{state['poem']}"
    return {"combined_output": combined}
Building Parallel Graph

Copy code
python
# Create parallel workflow
parallel_workflow = StateGraph(ParallelState)

# Add nodes
parallel_workflow.add_node("write_joke", write_joke)
parallel_workflow.add_node("write_story", write_story)
parallel_workflow.add_node("write_poem", write_poem)
parallel_workflow.add_node("aggregate", aggregate_content)

# Set entry point and parallel edges
parallel_workflow.set_entry_point("write_joke")
parallel_workflow.set_entry_point("write_story")
parallel_workflow.set_entry_point("write_poem")

# All parallel nodes connect to aggregator
parallel_workflow.add_edge("write_joke", "aggregate")
parallel_workflow.add_edge("write_story", "aggregate")
parallel_workflow.add_edge("write_poem", "aggregate")
parallel_workflow.add_edge("aggregate", END)

# Compile and test
parallel_chain = parallel_workflow.compile()
result = parallel_chain.invoke({"topic": "artificial intelligence"})
print(result["combined_output"])
Part 4: Routing Workflow
Router Schema

Copy code
python
class RouteDecision(BaseModel):
    step: str  # "joke", "story", or "poem"

class RoutingState(TypedDict):
    input: str
    decision: str
    output: str
Router Function

Copy code
python
def route_input(state: RoutingState):
    """Decide which type of content to create"""
    user_input = state["input"]
    
    router_llm = llm.with_structured_output(RouteDecision)
    prompt = f"""
    Based on the user input: "{user_input}"
    Decide whether to create a joke, story, or poem.
    Return one of: joke, story, poem
    """
    
    decision = router_llm.invoke(prompt)
    return {"decision": decision.step}

def create_joke_content(state: RoutingState):
    """Create joke content"""
    response = llm.invoke(f"Write a joke about: {state['input']}")
    return {"output": response.content}

def create_story_content(state: RoutingState):
    """Create story content"""
    response = llm.invoke(f"Write a story about: {state['input']}")
    return {"output": response.content}

def create_poem_content(state: RoutingState):
    """Create poem content"""
    response = llm.invoke(f"Write a poem about: {state['input']}")
    return {"output": response.content}

def route_decision(state: RoutingState) -> str:
    """Route based on decision"""
    return state["decision"]
Building Router Graph

Copy code
python
# Create routing workflow
routing_workflow = StateGraph(RoutingState)

# Add nodes
routing_workflow.add_node("router", route_input)
routing_workflow.add_node("joke", create_joke_content)
routing_workflow.add_node("story", create_story_content)
routing_workflow.add_node("poem", create_poem_content)

# Set routing logic
routing_workflow.set_entry_point("router")
routing_workflow.add_conditional_edges(
    "router",
    route_decision,
    {
        "joke": "joke",
        "story": "story",
        "poem": "poem"
    }
)

# End connections
routing_workflow.add_edge("joke", END)
routing_workflow.add_edge("story", END)
routing_workflow.add_edge("poem", END)

# Compile and test
routing_chain = routing_workflow.compile()
result = routing_chain.invoke({"input": "Tell me something funny about cats"})
print(f"Decision: {result['decision']}")
print(f"Output: {result['output']}")
Part 5: Orchestrator-Worker Pattern
Orchestrator Schema

Copy code
python
class ReportSection(BaseModel):
    name: str
    description: str

class SectionList(BaseModel):
    sections: List[ReportSection]

class OrchestratorState(TypedDict):
    topic: str
    sections: List[ReportSection]
    completed_sections: List[str]
    final_report: str

class WorkerState(TypedDict):
    section: ReportSection
    completed_sections: List[str]
Orchestrator Functions

Copy code
python
def create_plan(state: OrchestratorState):
    """Create a plan for the report"""
    topic = state["topic"]
    
    planner_llm = llm.with_structured_output(SectionList)
    prompt = f"""
    Create a plan for a comprehensive report on: {topic}
    Break it down into 3-5 main sections.
    Each section should have a name and description.
    """
    
    plan = planner_llm.invoke(prompt)
    return {"sections": plan.sections}

def write_section(state: WorkerState):
    """Write a report section"""
    section = state["section"]
    
    prompt = f"""
    Write a detailed section for a report.
    Section Name: {section.name}
    Section Description: {section.description}
    
    Write 2-3 paragraphs of content.
    """
    
    response = llm.invoke(prompt)
    section_content = f"## {section.name}\n\n{response.content}\n\n"
    
    return {"completed_sections": [section_content]}

def synthesize_report(state: OrchestratorState):
    """Combine all sections into final report"""
    sections = state["completed_sections"]
    final_report = "# Comprehensive Report\n\n" + "".join(sections)
    return {"final_report": final_report}
Building Orchestrator Graph

Copy code
python
from langgraph.graph import Send

# Create orchestrator workflow
orchestrator_workflow = StateGraph(OrchestratorState)

# Add nodes
orchestrator_workflow.add_node("planner", create_plan)
orchestrator_workflow.add_node("writer", write_section)
orchestrator_workflow.add_node("synthesizer", synthesize_report)

# Dynamic worker spawning
def spawn_workers(state: OrchestratorState):
    """Spawn workers for each section"""
    return [
        Send("writer", {"section": section})
        for section in state["sections"]
    ]

# Set up the graph
orchestrator_workflow.set_entry_point("planner")
orchestrator_workflow.add_conditional_edges("planner", spawn_workers)
orchestrator_workflow.add_edge("writer", "synthesizer")
orchestrator_workflow.add_edge("synthesizer", END)

# Compile and test
orchestrator_chain = orchestrator_workflow.compile()
result = orchestrator_chain.invoke({"topic": "Machine Learning in Healthcare"})
print(result["final_report"])
Part 6: Evaluator-Optimizer Pattern
Evaluator Schema

Copy code
python
class JokeEvaluation(BaseModel):
    funny: bool
    feedback: str

class EvaluatorState(TypedDict):
    topic: str
    joke: str
    funny: bool
    feedback: str
Evaluator Functions

Copy code
python
def generate_joke_with_feedback(state: EvaluatorState):
    """Generate or regenerate joke based on feedback"""
    topic = state["topic"]
    feedback = state.get("feedback", "")
    
    if feedback:
        prompt = f"""
        Write a joke about {topic}.
        Previous feedback: {feedback}
        Improve based on this feedback.
        """
    else:
        prompt = f"Write a funny joke about {topic}"
    
    response = llm.invoke(prompt)
    return {"joke": response.content}

def evaluate_joke(state: EvaluatorState):
    """Evaluate if the joke is funny"""
    joke = state["joke"]
    
    evaluator_llm = llm.with_structured_output(JokeEvaluation)
    prompt = f"""
    Evaluate this joke: "{joke}"
    Is it funny? Provide honest feedback.
    """
    
    evaluation = evaluator_llm.invoke(prompt)
    return {
        "funny": evaluation.funny,
        "feedback": evaluation.feedback
    }

def route_evaluation(state: EvaluatorState) -> str:
    """Route based on evaluation"""
    return "accepted" if state["funny"] else "rejected"
Building Evaluator Graph

Copy code
python
# Create evaluator workflow
evaluator_workflow = StateGraph(EvaluatorState)

# Add nodes
evaluator_workflow.add_node("generator", generate_joke_with_feedback)
evaluator_workflow.add_node("evaluator", evaluate_joke)
evaluator_workflow.add_node("accepted", lambda x: x)

# Set up the graph
evaluator_workflow.set_entry_point("generator")
evaluator_workflow.add_edge("generator", "evaluator")
evaluator_workflow.add_conditional_edges(
    "evaluator",
    route_evaluation,
    {
        "accepted": "accepted",
        "rejected": "generator"  # Loop back for improvement
    }
)
evaluator_workflow.add_edge("accepted", END)

# Compile an

Generate audio

Copy

Retry
continue


Copy code
python
# Compile and test
evaluator_chain = evaluator_workflow.compile()
result = evaluator_chain.invoke({"topic": "programming"})
print(f"Final joke: {result['joke']}")
print(f"Evaluation: {result['funny']}")
print(f"Feedback: {result['feedback']}")
Part 7: Reactive Agent Pattern
Agent State and Tools

Copy code
python
from langchain_core.messages import HumanMessage, AIMessage, ToolMessage
from typing import Annotated, Sequence
import operator

class AgentState(TypedDict):
    messages: Annotated[Sequence[HumanMessage | AIMessage | ToolMessage], operator.add]

# Define tools for the agent
def add(a: int, b: int) -> int:
    """Add two numbers together."""
    return a + b

def multiply(a: int, b: int) -> int:
    """Multiply two numbers together."""
    return a * b

def divide(a: int, b: int) -> float:
    """Divide two numbers."""
    if b == 0:
        return "Cannot divide by zero"
    return a / b

# Create tools list
tools = [add, multiply, divide]
Agent Functions

Copy code
python
def call_model(state: AgentState):
    """Call the LLM with tools"""
    messages = state["messages"]
    
    # Bind tools to LLM
    model_with_tools = llm.bind_tools(tools)
    
    # Add system message
    system_message = "You are a helpful assistant skilled at performing arithmetic operations."
    
    response = model_with_tools.invoke([
        {"role": "system", "content": system_message}
    ] + messages)
    
    return {"messages": [response]}

def call_tools(state: AgentState):
    """Execute tool calls"""
    messages = state["messages"]
    last_message = messages[-1]
    
    # Execute each tool call
    tool_outputs = []
    for tool_call in last_message.tool_calls:
        tool_name = tool_call["name"]
        tool_args = tool_call["args"]
        
        # Find and execute the tool
        if tool_name == "add":
            result = add(**tool_args)
        elif tool_name == "multiply":
            result = multiply(**tool_args)
        elif tool_name == "divide":
            result = divide(**tool_args)
        else:
            result = f"Unknown tool: {tool_name}"
        
        # Create tool message
        tool_message = ToolMessage(
            content=str(result),
            tool_call_id=tool_call["id"]
        )
        tool_outputs.append(tool_message)
    
    return {"messages": tool_outputs}

def should_continue(state: AgentState) -> str:
    """Determine if we should continue or end"""
    messages = state["messages"]
    last_message = messages[-1]
    
    # If the last message has tool calls, continue to tools
    if hasattr(last_message, 'tool_calls') and last_message.tool_calls:
        return "tools"
    else:
        return "end"
Building the Agent Graph

Copy code
python
# Create agent workflow
agent_workflow = StateGraph(AgentState)

# Add nodes
agent_workflow.add_node("agent", call_model)
agent_workflow.add_node("tools", call_tools)

# Set up the graph flow
agent_workflow.set_entry_point("agent")
agent_workflow.add_conditional_edges(
    "agent",
    should_continue,
    {
        "tools": "tools",
        "end": END
    }
)
agent_workflow.add_edge("tools", "agent")

# Compile the agent
agent = agent_workflow.compile()

# Test the agent
messages = [HumanMessage(content="Add 3 and 4, then multiply the result by 2")]
result = agent.invoke({"messages": messages})

# Print the conversation
for message in result["messages"]:
    if isinstance(message, HumanMessage):
        print(f"Human: {message.content}")
    elif isinstance(message, AIMessage):
        if message.tool_calls:
            print(f"AI: Making tool calls: {message.tool_calls}")
        else:
            print(f"AI: {message.content}")
    elif isinstance(message, ToolMessage):
        print(f"Tool: {message.content}")
Pre-built Agent Alternative

Copy code
python
# Using LangGraph's pre-built agent
from langgraph.prebuilt import create_react_agent

# Create agent with tools
prebuilt_agent = create_react_agent(llm, tools)

# Test the pre-built agent
result = prebuilt_agent.invoke({
    "messages": [HumanMessage(content="Calculate (15 + 25) * 3")]
})

print("Pre-built agent result:")
for message in result["messages"]:
    print(f"{type(message).__name__}: {message.content}")
🧠 Key Concepts & Insights
Workflows vs Agents
Workflows: Predefined code paths with LLM calls embedded within scaffolding
Agents: LLM-directed actions without predefined scaffolding, using environmental feedback
LangGraph Core Benefits
Persistence: Built-in memory and state management
Human-in-the-loop: Ability to pause, review, and continue workflows
Streaming: Flexible control over what gets streamed from workflows
Deployment: Easy transition from development to production
State Management
TypedDict: Defines the structure of data flowing through the graph
Annotations: Control how state updates are handled (e.g., operator.add for lists)
State Sharing: Multiple nodes can read from and write to shared state
Graph Construction Patterns
Sequential: Linear flow from one node to the next
Parallel: Multiple nodes executing simultaneously
Conditional: Dynamic routing based on state or LLM decisions
Loops: Feedback loops for iterative improvement
Tool Calling Architecture
Tool Definition: Functions with proper docstrings and type hints
Tool Binding: Connecting tools to LLMs using bind_tools()
Tool Execution: Separate node that executes tool calls and returns results
Environmental Feedback: Tool results fed back to LLM for next decision
Structured Outputs
Pydantic Models: Define expected output structure
Validation: Automatic validation of LLM responses
Consistency: Guaranteed format for downstream processing
⚠️ Common Errors & Fixes
Issue: State Key Conflicts
Error: KeyError when accessing state keys that don't exist

Fix:


Copy code
python
# Always check if key exists or provide defaults
def safe_function(state: MyState):
    value = state.get("optional_key", "default_value")
    return {"result": value}
Issue: Tool Call Parsing Errors
Error: AttributeError when accessing tool_calls on messages

Fix:


Copy code
python
# Check if message has tool_calls attribute
if hasattr(message, 'tool_calls') and message.tool_calls:
    # Process tool calls
    pass
Issue: Infinite Loops in Agents
Error: Agent keeps making tool calls without ending

Fix:


Copy code
python
# Add maximum iteration limits
def should_continue(state: AgentState) -> str:
    messages = state["messages"]
    
    # Limit iterations
    if len(messages) > 20:
        return "end"
    
    last_message = messages[-1]
    if hasattr(last_message, 'tool_calls') and last_message.tool_calls:
        return "tools"
    return "end"
Issue: Memory Issues with Large States
Error: Out of memory errors with complex workflows

Fix:


Copy code
python
# Use checkpointing for large workflows
from langgraph.checkpoint.sqlite import SqliteSaver

# Add memory to your graph
memory = SqliteSaver.from_conn_string(":memory:")
graph = workflow.compile(checkpointer=memory)
Issue: API Rate Limiting
Error: Rate limit exceeded errors

Fix:


Copy code
python
import time
from functools import wraps

def rate_limit(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        time.sleep(1)  # Add delay between calls
        return func(*args, **kwargs)
    return wrapper

@rate_limit
def call_llm(prompt):
    return llm.invoke(prompt)
🌱 What You Can Build Next
1. Multi-Agent Research System
Combine multiple patterns to create a comprehensive research system:

Orchestrator: Plans research topics and assigns tasks
Specialist Agents: Each focuses on different domains (technical, business, academic)
Evaluator: Reviews and synthesizes findings
Router: Directs queries to appropriate specialists

Copy code
python
# Example structure
class ResearchState(TypedDict):
    query: str
    research_plan: List[str]
    specialist_reports: List[str]
    final_synthesis: str
    quality_score: float
2. Content Creation Pipeline
Build an end-to-end content creation system:

Topic Generator: Creates content ideas based on trends
Content Creator: Writes articles, blogs, or social media posts
SEO Optimizer: Optimizes content for search engines
Quality Checker: Ensures content meets standards
Publisher: Formats and schedules content
3. Customer Support Automation
Create an intelligent customer support system:

Intent Classifier: Routes customer queries to appropriate handlers
Knowledge Base Agent: Searches internal documentation
Escalation Manager: Determines when to involve human agents
Response Generator: Creates personalized responses
Satisfaction Tracker: Monitors and improves service quality
🧾 Resources & Links
Official Documentation
LangGraph Documentation
LangChain Documentation
Anthropic API Documentation
GitHub Repositories
LangGraph Examples
LangChain Templates
Tutorial Resources
Building Effective Agents Blog Post (Referenced in video)
LangGraph Tutorial Notebook
Additional Learning
Pydantic Documentation - For structured outputs
Python TypedDict Guide - For state management
Jupyter Notebook Documentation - For development environment
Community Resources
LangChain Discord - Community support
LangGraph GitHub Discussions - Technical discussions
LangChain Blog - Latest updates and tutorials
Video Tutorial
Original Video: Building Effective Agents with LangGraph - Complete walkthrough by Lance from LangChain
This comprehensive guide provides everything needed to understand and implement the various workflow and agent patterns demonstrated in the video. Each pattern builds upon the previous ones, creating a solid foundation for building sophisticated AI applications with LangGraph.


