import { Menu, MenuItem } from '@blueprintjs/core';
import { useNavigate, useMatch } from 'react-router-dom';

function SidebarItem({ icon, text, to }: { icon: string; text: string; to: string }) {
  const navigate = useNavigate();
  const match = useMatch(to);
  return <MenuItem icon={icon as any} text={text} active={!!match} onClick={() => navigate(to)} />;
}

export function Sidebar() {
  return (
    <div style={{ width: 220, borderRight: '1px solid #383e47', display: 'flex', flexDirection: 'column', padding: '1rem 0' }}>
      <Menu large style={{ background: 'transparent' }}>
        <SidebarItem icon="list" text="Queue" to="/queue" />
        <SidebarItem icon="music" text="Episodes" to="/episodes" />
        <SidebarItem icon="bookmark" text="Subscriptions" to="/subscriptions" />
        <SidebarItem icon="download" text="Downloads" to="/downloads" />
        <SidebarItem icon="history" text="History" to="/history" />
      </Menu>
    </div>
  );
}
