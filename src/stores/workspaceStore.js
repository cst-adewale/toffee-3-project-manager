import { create } from 'zustand';

export const useWorkspaceStore = create((set) => ({
  selectedProjectId: '',
  draggedIssueId: null,
  selectedIssueId: null,
  selectedSprintId: 'all',
  workspaceView: 'board',
  theme: localStorage.getItem('toffee_theme') || 'light',
  setSelectedProjectId: (selectedProjectId) => set({ selectedProjectId }),
  setDraggedIssueId: (draggedIssueId) => set({ draggedIssueId }),
  setSelectedIssueId: (selectedIssueId) => set({ selectedIssueId }),
  setSelectedSprintId: (selectedSprintId) => set({ selectedSprintId }),
  setWorkspaceView: (workspaceView) => set({ workspaceView }),
  toggleTheme: () => set((state) => {
    const theme = state.theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('toffee_theme', theme);
    return { theme };
  }),
}));
