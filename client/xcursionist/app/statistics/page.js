'use client'; 
import React from 'react';
import StatisticsPeople from '@/components/tabelInformatii';
import { AppSidebar } from '@/components/SideBar';
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { CardWithForm } from '@/components/excursii_card';

class Appp extends React.Component {
  render() {
    return (  
      <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
        {/* Sidebar Component */}
        <div style={{ position: 'relative', zIndex: 10 }}>
          <SidebarProvider>
            <AppSidebar />
            <main>
            <SidebarTrigger />
            </main>
           
          </SidebarProvider>
        </div>
        

        {/* Main Content (StatisticsPeople Component) */}
        <div style={{ flexGrow: 1, paddingLeft: '20px' }}>
          <StatisticsPeople />
        </div>
       
      </div>
    );
  }
}
export default Appp;
