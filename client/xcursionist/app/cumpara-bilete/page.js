'use client';
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation'; // Import the correct hook
import { AppSidebar } from '@/components/SideBar';
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { CardWithForm } from '@/components/event_part';

const Appp = () => {
  const searchParams = useSearchParams(); // Use useSearchParams hook to get query params
  const [eventData, setEventData] = useState(null);

  // Get the event ID from the query parameters
  const eventId = searchParams.get('id'); // Get 'id' from the URL query

  // Fetch event data based on ID
  useEffect(() => {
    if (eventId) {
      fetch(`http://localhost:9000/cumpara-bilete?id=${eventId}`)
        .then((response) => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        })
        .then((data) => {
          setEventData(data[0]);  // Assuming the response is an array and we're interested in the first item
        })
        .catch((error) => {
          console.error('Error fetching event data:', error);
        });
    }
  }, [eventId]);
  console.log(eventData);
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

      {/* Main Content */}
      <div style={{ flexGrow: 1, paddingLeft: '20px', paddingTop: '50px' }}>
        {eventData ? (
          <CardWithForm eventData={eventData} />
        ) : (
          <div></div>
        )}
      </div>
    </div>
  );
};

export default Appp;
