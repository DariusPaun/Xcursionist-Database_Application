'use client'; // Ensures the component is client-side
import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useRouter } from 'next/navigation';

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

// Custom component to replace DialogDescription and ensure no <p> tags are used
const CustomDialogDescription = ({ children, className }) => {
  return (
    <div className={`text-sm text-white ${className}`}>
      {children}
    </div>
  );
};

export default function EventList() {
  const [events, setEvents] = useState([]);
  const [groupedAttractions, setGroupedAttractions] = useState({});
  const router = useRouter(); // Initialize useRouter hook

  // Fetch events and attractions from the API
  useEffect(() => {
    fetch("http://localhost:9000/events")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        // Group attractions by Eveniment_Id
        const grouped = data.reduce((acc, attraction) => {
          if (!acc[attraction.Eveniment_Id]) {
            acc[attraction.Eveniment_Id] = [];
          }
          acc[attraction.Eveniment_Id].push(attraction);
          return acc;
        }, {});

        setGroupedAttractions(grouped);

        // Get unique events with their names
        const uniqueEvents = data.reduce((acc, attraction) => {
          if (!acc.find(event => event.Eveniment_Id === attraction.Eveniment_Id)) {
            acc.push({
              Eveniment_Id: attraction.Eveniment_Id,
              Nume_Eveniment: attraction.Nume_Eveniment, // Assuming this field is present
              pret: attraction.pret,
              Data_Inceput: attraction.Data_Inceput.split("T")[0],
              Data_final: attraction.Data_final.split("T")[0],
              Descriere: attraction.Descriere,
            });
          }
          return acc;
        }, []);

        setEvents(uniqueEvents);
      })
      .catch((error) => console.error("Error fetching events:", error));
  }, []);

  const handleNavigation = (url, id) => {
    router.push(`${url}?id=${id}`);  // Only pass ID to the URL
  };

  return (
    <div className="flex flex-col items-start justify-start space-y-4 w-[90%] mx-auto">
      {/* Carousel for Event Buttons (Showing 3 items at once) */}
      <Carousel
        opts={{
          align: "start",
        }}
        orientation="horizontal"
        className="w-full max-w-full" // Ensures full-width for the carousel
      >
        <CarouselContent className="flex gap-4">
          {events.map((event) => {
            const eventAttractions = groupedAttractions[event.Eveniment_Id] || [];
            const eventTitle = event.Nume_Eveniment;
            const Id = event.Eveniment_Id;
            const eventPrice = `${event.pret} RON`;
            const eventDate1list = `${event.Data_Inceput}`.split("-");
            const eventDate2list = `${event.Data_final}`.split("-");
            const eventDate1 = `${eventDate1list[2]}-${eventDate1list[1]}-${eventDate1list[0]}`;
            const eventDate2 = `${eventDate2list[2]}-${eventDate2list[1]}-${eventDate2list[0]}`;
            const eventDescription = event.Descriere;

            return (
              <CarouselItem key={event.Eveniment_Id} className="basis-[32%]"> {/* Display 3 items per screen */}
                <Sheet key={event.Eveniment_Id}>
                  <SheetTrigger asChild>
                    <Button
                      variant="secondary"
                      className="w-full h-[200px] text-black hover:bg-orange-500 bg-cover bg-center relative"
                      style={{ backgroundImage: `url('https://img.freepik.com/free-vector/travel-background_23-2148057717.jpg')` }} // Use the URL of the image
                    >
                      {/* Title at the top-center */}
                      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 translate-y-14 text-xl font-bold text-black p-2">
                        {eventTitle}
                      </div>

                      {/* Date at the bottom-left */}
                      <div className="absolute bottom-0 left-0 -translate-y-7 p-2 text-sm text-black">
                        {eventDate1}
                      </div>
                      <div className="absolute bottom-0 left-0 p-2 text-sm text-black">
                        {eventDate2}
                      </div>

                      {/* Price at the bottom-right */}
                      <div className="absolute bottom-0 right-0 p-2 text-sm text-black">
                        {eventPrice}
                      </div>
                    </Button>
                  </SheetTrigger>
                  <SheetContent className="max-h-[100vh] overflow-y-scroll no-scrollbar bg-gray-900 text-white">
                    <SheetHeader>
                      <SheetTitle className="text-white">{eventTitle}</SheetTitle>
                      <CustomDialogDescription className="text-white">
                        <div style={{ marginTop: '40px' }}>{eventDescription}</div>
                        <div style={{ marginTop: '40px' }} className="mt-5 text-lg">In cadrul acestui eveniment veți vizita:</div>
                        {eventAttractions.length > 0 ? (
                          <div>
                            {eventAttractions.map((attraction) => (
                              <div key={attraction.Atractii_Id} className="py-4">
                                <Separator className="my-4" />
                                <div className="text-lg font-semibold">{attraction.Nume_Atractie}</div>
                                <div className="text-sm">{attraction.Descriere_Atractie}</div>
                                {attraction.URL_Poza && (
                                  <div className="mt-4">
                                    <img
                                      src={attraction.URL_Poza}
                                      alt={attraction.Nume_Atractie}
                                      className="w-full h-auto rounded-md"
                                    />
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div>No attractions available for this event.</div>
                        )}
                      </CustomDialogDescription>
                    </SheetHeader>
                    <SheetFooter>
                      <SheetClose asChild>
                        <Button
                          variant="primary"
                          className="text-black bg-blue-500 hover:bg-orange-700"
                          onClick={() => handleNavigation("/cumpara-bilete", Id)} // Use the ID to navigate
                        >
                          Cumpara Bilet
                        </Button>
                      </SheetClose>
                    </SheetFooter>
                  </SheetContent>
                </Sheet>
              </CarouselItem>
            );
          })}
        </CarouselContent>

        <CarouselPrevious>
          <Button variant="ghost" className="text-black hover:bg-orange-500">Previous</Button>
        </CarouselPrevious>

        <CarouselNext>
          <Button variant="ghost" className="text-black hover:bg-orange-500">Next</Button>
        </CarouselNext>
      </Carousel>
    </div>
  );
}
