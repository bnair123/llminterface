import type { ChatThread, ModelDescriptor } from "../../../../packages/contracts/src";
import { MessageRenderer } from "./MessageRenderer";

interface ChatWindowProps {
  thread: ChatThread;
  models: ModelDescriptor[];
  isStreaming: boolean;
  draft: string;
  onDraftChange: (next: string) => void;
  onSend: () => void;
  onSelectModel: (modelId: string) => void;
}

export const ChatWindow = ({
  thread,
  models,
  isStreaming,
  draft,
  onDraftChange,
  onSend,
  onSelectModel
}: ChatWindowProps) => {
  return (
    <main className="chat-shell glass-pane">
      <header className="chat-head">
        <div>
          <h2>{thread.title}</h2>
          <p>Single-model streaming chat</p>
        </div>
        <label className="model-picker">
          <span>Model</span>
          <select
            value={thread.modelId}
            onChange={(event) => onSelectModel(event.target.value)}
            disabled={isStreaming}
          >
            {models.map((model) => (
              <option key={model.id} value={model.id}>
                {model.displayName} ({model.provider})
              </option>
            ))}
          </select>
        </label>
      </header>

      <section className="messages">
        {thread.messages.length === 0 ? (
          <div className="empty">Start a conversation to begin streaming responses.</div>
        ) : (
          thread.messages.map((message) => (
            <article key={message.id} className={`message ${message.role}`}>
              <div className="meta">{message.role}</div>
              <MessageRenderer content={message.content} />
            </article>
          ))
        )}
      </section>

      <footer className="composer">
        <textarea
          value={draft}
          placeholder="Ask anything..."
          onChange={(event) => onDraftChange(event.target.value)}
          disabled={isStreaming}
        />
        <button onClick={onSend} disabled={isStreaming || !draft.trim()}>
          {isStreaming ? "Streaming..." : "Send"}
        </button>
      </footer>
    </main>
  );
};
