import { SidebarTrigger, useSidebar } from '@troott/ui/sidebar';
import storage from '@/api/services/local-storage';
import React from 'react';

const Trigger = () => {
    const { open, setOpen } = useSidebar();

    React.useEffect(() => {
        storage.keep('sidebar-collapsed', String(!open));
    }, [open]);

    return <SidebarTrigger onClick={() => setOpen(!open)} />;
};

export default Trigger;
