'use client';  // This ensures that the component is client-side
import Image from 'next/image';
import logo from './assets/Xcur_empty-removebg-preview.png';
import { useRouter } from 'next/navigation';  // Import useRouter from Next.js
import { KeyRound, ChartColumn, Database, Trees ,UserRoundPlus,Briefcase,CalendarCog} from 'lucide-react';
import { Separator } from '@radix-ui/react-select';
import React from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from "@/components/ui/sidebar";

// Menu items
const items = [
  {
    title: "Evenimente",
    url: "/events",
    icon: Trees,
  },
  {
    title: "Creaza cont",
    url: "/creaza-cont",
    icon: UserRoundPlus,
  },
  {
    title: "Afiseaza statistici",
    url: "/statistics",
    icon: ChartColumn,
  },
  {
    title: "Adauga Angajat",
    url: "/creaza-angajat",
    icon: Briefcase,
  },
  {
    title:"Adauga evenimente",
    url:"/modifca-eveniment",
    icon: CalendarCog
  },
  {
    title:"Baza de date",
    url:"/baza-de-date",
    icon:Database,
  }
];

export function AppSidebar() {
  const router = useRouter();  // Initialize useRouter hook

  const handleNavigation = (url) => {
    router.push(url);  // Navigate to the specified URL
  };

  return (
    <Sidebar style={{ backgroundColor: 'orange' }}>  {/* Set sidebar background to orange */}
      <SidebarHeader>
        <Image  
          src={logo} 
          alt="Site Logo" 
          width={673} 
          height={140} 
        />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Managment</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item, index) => (
                <React.Fragment key={item.title}>
                  <SidebarMenuItem key={`menu-item-${item.title}`}>
                    <SidebarMenuButton 
                      asChild 
                      onClick={() => handleNavigation(item.url)}  // Trigger navigation on click
                    >
                      <a>
                        <item.icon />
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  {/* Add separator after the first two items */}
                  {index === 1 && <Separator style={{ height: '1px', backgroundColor: 'black', margin: '8px 0',width: '70%' }} />}
                </React.Fragment>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
