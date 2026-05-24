import { create } from 'zustand';

export const useWorkspaceStore = create((set) => ({
  selectedProjectId: '',
  draggedIssueId: null,
  selectedIssueId: null,
  selectedSprintId: 'all',
  setSelectedProjectId: (selectedProjectId) => set({ selectedProjectId }),
  setDraggedIssueId: (draggedIssueId) => set({ draggedIssueId }),
  setSelectedIssueId: (selectedIssueId) => set({ selectedIssueId }),
  setSelectedSprintId: (selectedSprintId) => set({ selectedSprintId }),
}));
