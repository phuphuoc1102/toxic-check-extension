import React, {useRef, useState} from 'react';
import {useNavigate} from 'react-router-dom';

const Overview = ({countItem}) => {
  const navigate = useNavigate();

  const openFolder = () => navigate('/vault/folder-manager');
  const openPassword = () =>
    navigate('/vault/home', {state: {currentCategory: 'password'}});
  const openContact = () =>
    navigate('/vault/home', {state: {currentCategory: 'contact'}});

  const data = [
    {
      id: '0',
      icon: '/icons/login.png',
      title: 'Login',
      countsItems: countItem?.count_folder,
      outerColor: 'bg-blue-100',
      innerColor: 'bg-blue-400',
      onClick: openFolder,
    },
    {
      id: '1',
      icon: '/icons/browse.png',
      title: 'Browse',
      countsItems: countItem?.count_password,
      outerColor: 'bg-green-100',
      innerColor: 'bg-green-400',
      onClick: openPassword,
    },
    {
      id: '2',
      icon: '/icons/card.png',
      title: 'Card',
      countsItems: countItem?.count_contact,
      outerColor: 'bg-pink-100',
      innerColor: 'bg-pink-400',
      onClick: openContact,
    },
  ];

  return (
    <div className="relative  ">
      <div className=" flex overflow-x-auto gap-4  no-scrollbar scroll-smooth">
        {data.map(item => (
          <div
            key={item.id}
            className={`pb-5 flex ml-1 flex-col justify-between items-center px-6 pt-3 rounded-[17px] shadow-md cursor-pointer min-w-[80px] ${item.outerColor}`}
            onClick={item.onClick}>
            <div
              className={`flex justify-center items-center w-10 h-10 rounded-full ${item.innerColor}`}>
              <img
                src={item.icon}
                alt={item.title}
                className="w-5 h-5 filter invert-0 brightness-0"
              />
            </div>
            <p className="mt-3 font-semibold text-center text-gray-500 text-xs">{item.title}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Overview;
