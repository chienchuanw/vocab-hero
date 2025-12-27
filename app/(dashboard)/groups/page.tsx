'use client';

import { useState } from 'react';
import { Layout } from '@/components/shared';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { GroupList } from '@/components/features/groups/GroupList';
import { AddGroupDialog } from '@/components/features/groups/AddGroupDialog';
import { EditGroupDialog } from '@/components/features/groups/EditGroupDialog';
import { useGroups, type Group } from '@/hooks/useGroups';

/**
 * Groups Page
 * Main page for vocabulary groups management
 */
export default function GroupsPage() {
  // Dialog state
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);

  // Data query
  const groupsQuery = useGroups();

  // Handle edit
  const handleEdit = (group: Group) => {
    setSelectedGroup(group);
    setEditDialogOpen(true);
  };

  // Handle group click - navigate to group detail (future implementation)
  const handleGroupClick = (group: Group) => {
    // TODO: Navigate to group detail page in future phase
    console.log('Group clicked:', group.id);
  };

  return (
    <Layout streak={0}>
      <div className="space-y-6">
        {/* Page header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Groups</h1>
            <p className="text-muted-foreground mt-1">
              Organize your vocabulary into groups
            </p>
          </div>
          <Button onClick={() => setAddDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Group
          </Button>
        </div>

        {/* Groups list */}
        <GroupList
          query={groupsQuery}
          onEdit={handleEdit}
          onClick={handleGroupClick}
        />

        {/* Dialogs */}
        <AddGroupDialog open={addDialogOpen} onOpenChange={setAddDialogOpen} />
        <EditGroupDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          group={selectedGroup}
        />
      </div>
    </Layout>
  );
}

