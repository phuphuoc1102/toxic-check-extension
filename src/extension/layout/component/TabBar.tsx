import React, {useMemo} from 'react';
import {useNavigate} from 'react-router-dom';
import TabIcon from './TabIcon';
import '../../../assets/css/index.css';
interface TabBarProps {
  activePage: ActiveTabType;
}

type Tab = {
  id: ActiveTabType;
  icon: string;
  path: string;
};

export type ActiveTabType = 'vault' | 'add' | 'setting';

const tabs: Tab[] = [
  {id: 'vault', icon: './icons/menu.png', path: ''},
  {id: 'add', icon: './icons/add.png', path: '/add-password'},
  {
    id: 'setting',
    icon: './icons/user.png',
    path: '/profile',
  },
];

const TabBar: React.FC<TabBarProps> = ({activePage}) => {
  const [activeTab, setActiveTab] = React.useState<ActiveTabType>(activePage);
  const navigate = useNavigate();

  const handleNavigate = (tab: Tab) => {
    setActiveTab(tab.id);
    navigate(tab.path);
  };

  const getActiveColor = useMemo(() => {
    return (id: ActiveTabType) => {
      return id === activeTab ? '#2384F7' : '#CDCDE0';
    };
  }, [activeTab]);

  return (
    <div className="relative tab-bar flex justify-around bg-white shadow-md py-2">
      {tabs.map(tab =>
        tab.id === 'add' ? (
          <button
            key={tab.id}
            onClick={() => handleNavigate(tab)}
            className="absolute -top-6 z-10 w-12 h-12 rounded-full bg-blue-500 shadow-lg shadow-blue-300 flex items-center justify-center
             after:content-[''] after:absolute after:top-1/2 after:left-0 after:w-full after:h-1/2 after:rounded-b-full 
             after:bg-blue-500 after:blur-xl after:opacity-50">
            <img
              src={tab.icon}
              className="w-5 h-5 filter invert brightness-100"
            />
          </button>
        ) : (
          <div
            key={tab.id}
            className={`tab-item flex flex-col items-center justify-center cursor-pointer ${
              activeTab === tab.id ? 'text-blue-500' : 'text-gray-500'
            }`}
            onClick={() => handleNavigate(tab)}>
            <TabIcon
              icon={tab.icon}
              color={getActiveColor(tab.id)}
              focused={activeTab === tab.id}
            />
          </div>
        ),
      )}
    </div>
  );
};

export default TabBar;
