import { ChatWindow } from "./components/ChatWindow";
import { Sidebar } from "./components/Sidebar";
import { useChatApp } from "./hooks/useChatApp";

export const App = () => {
  const {
    state,
    models,
    activeThread,
    activeThreadId,
    setActiveThreadId,
    isStreaming,
    draft,
    setDraft,
    sendMessage,
    createThread,
    selectModel
  } = useChatApp();

  if (!state || !activeThread) {
    return <div className="boot">Loading workspace...</div>;
  }

  return (
    <div className="app-frame">
      <Sidebar
        state={state}
        activeThreadId={activeThreadId}
        onSelectThread={setActiveThreadId}
        onCreateThread={() => {
          void createThread();
        }}
      />
      <ChatWindow
        thread={activeThread}
        models={models}
        isStreaming={isStreaming}
        draft={draft}
        onDraftChange={setDraft}
        onSend={() => {
          void sendMessage();
        }}
        onSelectModel={(modelId) => {
          void selectModel(modelId);
        }}
      />
    </div>
  );
};
