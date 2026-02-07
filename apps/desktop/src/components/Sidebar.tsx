import type { RepositoryState } from "../../../../packages/contracts/src";

interface SidebarProps {
  state: RepositoryState;
  activeThreadId: string;
  onSelectThread: (threadId: string) => void;
  onCreateThread: () => void;
}

export const Sidebar = ({
  state,
  activeThreadId,
  onSelectThread,
  onCreateThread
}: SidebarProps) => {
  return (
    <aside className="sidebar glass-pane">
      <div className="sidebar-head">
        <h1>Liquid Glass</h1>
        <button onClick={onCreateThread}>New Chat</button>
      </div>

      {state.projects.map((project) => {
        const folders = state.folders.filter((folder) => folder.projectId === project.id);
        return (
          <section key={project.id} className="project-section">
            <h2>{project.name}</h2>
            {folders.map((folder) => {
              const threads = state.threads
                .filter((thread) => thread.folderId === folder.id)
                .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

              return (
                <div key={folder.id} className="folder-section">
                  <h3>{folder.name}</h3>
                  <ul>
                    {threads.map((thread) => (
                      <li key={thread.id}>
                        <button
                          className={thread.id === activeThreadId ? "thread active" : "thread"}
                          onClick={() => onSelectThread(thread.id)}
                        >
                          {thread.title}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </section>
        );
      })}
    </aside>
  );
};
