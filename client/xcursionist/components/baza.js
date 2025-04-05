    import React, { useEffect, useState } from "react";
    import { useToast } from "@/hooks/use-toast"
    import { Button } from "@/components/ui/button"
    import { ToastAction } from "@/components/ui/toast"
    import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
    import { Label } from "@/components/ui/label";
    import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
    import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
    import { Separator } from "@/components/ui/separator";
    import { Input } from "@/components/ui/input";
    import {
      Dialog,
      DialogContent,
      DialogDescription,
      DialogFooter,
      DialogHeader,
      DialogTitle,
      DialogTrigger,
    } from "@/components/ui/dialog";
  import { CalendarIcon } from "lucide-react";
  import { format } from "date-fns";
  import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
  import { Calendar } from "@/components/ui/calendar";
  export function PopoverDemo({id}) {
    const [allOrganizatori, setAllOrganizatori] = useState([]);
    const [organizatoriEvents, setOrganizatoriEvents] = useState([]);
    const [selectedOrganizers, setSelectedOrganizers] = useState([]);
  
    // Fetch data from the API
    useEffect(() => {
      const fetchData = async () => {
        try {
          const response = await fetch("http://localhost:9000/organizatori");
          const data = await response.json();
          setAllOrganizatori(data.All_organizatori);
          setOrganizatoriEvents(data.organizatori_events);
  
          // Initialize the selected organizers based on the organizatori_events
          const selected = data.organizatori_events
        .filter((event) => event.Evenitment_Id === id)  // Filtrează evenimentele care au Evenitment_Id egal cu ID
        .map((event) => event.Organizatori_Id); 
          setSelectedOrganizers(selected);
        } catch (error) {
          console.error("Error fetching organizers data:", error);
        }
      };
  
      fetchData();
    }, []);
  
    // Handle checkbox change
    const handleCheckboxChange = (organizerId) => {
      setSelectedOrganizers((prev) =>
        prev.includes(organizerId)
          ? prev.filter((id) => id !== organizerId) // Deselect if already selected
          : [...prev, organizerId] // Select if not selected
      );
    };
    const { toast } = useToast()
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">Organizatori</Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="grid gap-4">
            <div className="space-y-2">
              <h4 className="font-medium leading-none">Select Organizers</h4>
              <p className="text-sm text-muted-foreground">
                Choose the organizers for the event.
              </p>
            </div>
  
            {/* Render checkboxes for all organizers */}
            <div className="space-y-2">
              {allOrganizatori.map((organizer) => (
                <div key={organizer.Organizatori_Id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`organizer-${organizer.Organizatori_Id}`}
                    checked={selectedOrganizers.includes(organizer.Organizatori_Id)}
                    onChange={() => handleCheckboxChange(organizer.Organizatori_Id)}
                    className="h-4 w-4"
                  />
                  <Label htmlFor={`organizer-${organizer.Organizatori_Id}`} className="text-sm">
                    {organizer.nume_complet}
                  </Label>
                </div>
              ))}
            </div>
  
            {/* Optionally, render a Save button to handle the form submission */}
            <div className="mt-4">
            <Button
              variant="outline"
              onClick={() => {
                toast({
                  
                  style: {
                    backgroundColor: "rgba(255, 115, 0, 0.9)", // fundal opac
                    color: "black", // text alb pentru contrast
                    borderRadius: "9px", // colțuri rotunjite
                    
                  },
                  description: "Acțiune realizată cu succes",
                })
                // Asigură-te că ai `id` și `selectedOrganizers` corect definite
                const payload = {
                  id,
                  selectedOrganizers  // Array-ul cu organizatori selectați
                };

                // Trimite cererea POST la server
                console.log(JSON.stringify(payload))
                fetch("http://localhost:9000/change_org_event", {
                  method: "POST",  // Metoda HTTP pentru a trimite date
                  headers: {
                    "Content-Type": "application/json",  // Specifică faptul că trimitem JSON
                  },
                  body: JSON.stringify(payload),  // Transforma obiectul `payload` într-un JSON
                  
                })
                  .then((response) => response.json())  // Parsează răspunsul serverului ca JSON
                  .then((data) => {
                    console.log("Data returned from server:", data);  // Vezi ce răspunde serverul
                  })
                  .catch((error) => {
                    console.error("Error saving organizers:", error);  // Tratează erorile
                  });
              }}
              
            >
              Save
            </Button>     

            </div>
          </div>
        </PopoverContent>
      </Popover>
    );
  }
  export function CopyEventDialog({ event }) {
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState(""); 
    const { toast } = useToast()

    const handleCopyEvent = async () => {
      if (!startDate || !endDate || !startTime || !endTime) {
        alert("Please select both start and end date and time");
        return;
      }

      // Format the date and time into a datetime string
      const formattedStartDatetime = `${format(startDate, "yyyy-MM-dd")}T${startTime}`;
      const formattedEndDatetime = `${format(endDate, "yyyy-MM-dd")}T${endTime}`;

      try {
        const response = await fetch("http://localhost:9000/copy-event", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: event.Eveniment_Id,
            startDatetime: formattedStartDatetime,
            endDatetime: formattedEndDatetime,
          }),
        });
        
        if (response.ok) {
          toast({
                  
            style: {
              backgroundColor: "rgba(255, 115, 0, 0.9)", // fundal opac
              color: "black", // text alb pentru contrast
              borderRadius: "9px", // colțuri rotunjite
              
            },
            description: "Eveniment copiat cu succes",
          })
        } else {
          alert("Failed to copy the event. Please try again.");
        }
      } catch (error) {
        console.error("Error copying event:", error);
        alert("An error occurred while copying the event.");
      }
    };

    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline">Copy Event</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px] bg-gray-800 text-white">
          <DialogHeader>
            <DialogTitle>Copy Event</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Start Date Picker */}
            <div className="flex space-x-2">
              <div>
                <label className="text-white">Start Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-[180px] justify-start text-left font-normal"
                    >
                      <CalendarIcon />
                      {startDate ? format(startDate, "PPP") : "Pick a start date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 z-50 pointer-events-auto">
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={setStartDate}
                        initialFocus
                      />
                    </PopoverContent>
                </Popover>
              </div>
              <div>
                <label className="text-white">Start Time</label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-[180px] text-white bg-gray-800 border border-gray-600 p-2 rounded"
                />
              </div>
            </div>

            {/* End Date Picker */}
            <div className="flex space-x-2">
              <div>
                <label className="text-white">End Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-[180px] justify-start text-left font-normal"
                    >
                      <CalendarIcon />
                      {endDate ? format(endDate, "PPP") : "Pick an end date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 z-50 pointer-events-auto">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <label className="text-white">End Time</label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-[180px] border bg-gray-800 border-gray-600 p-2 rounded"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleCopyEvent} variant="outline">
              Copy
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

    export function EmployeeTabs() {
      const [employees, setEmployees] = useState([]);
      const [realemployees, setRealEmployees] = useState([]);
      const [isValid, setIsValid] = useState(true);
      const [employeeSalaries, setEmployeeSalaries] = useState({});
      const [before, setBefore] = useState('');
      const [now, setNow] = useState('');
      const [then, setThen] = useState('');
      const [events, setEvents] = useState({ upcoming: [], ongoing: [], past: [] });
      const {toast} = useToast()

      // Fetch employees data
      useEffect(() => {
        fetch("http://localhost:9000/angajati")
          .then((response) => response.json())
          .then((data) => setRealEmployees(data))
          .catch((error) => console.error("Error fetching realemployees:", error));
      }, []);

      useEffect(() => {
        fetch("http://localhost:9000/excursionisti")
          .then((response) => response.json())
          .then((data) => setEmployees(data))
          .catch((error) => console.error("Error fetching excursionists:", error));
      }, []);

      // Fetch events data
      useEffect(() => {
        const fetchEvents = async () => {
          try {
            const response = await fetch(`http://localhost:9000/events-show?before=${before}&now=${now}&then=${then}`);
            if (response.ok) {
              const data = await response.json();
              setEvents(data);
            } else {
              throw new Error('Failed to fetch events');
            }
          } catch (error) {
            console.error("Error fetching events:", error);
          }
        };
    
        // Debounce the API call to avoid excessive requests during typing
        const timeoutId = setTimeout(() => {
          fetchEvents();
        }, 500); // 500 ms delay
    
        // Cleanup function to clear the timeout if the component unmounts or the values change
        return () => clearTimeout(timeoutId);
      }, [before, now, then]); 

      // Delete employee
      

      // Update salary logic
      const handleSalaryChange = (e, employeeId) => {
        const value = e.target.value;
        const isValidSalary = /^[0-9]+(\.[0-9]{1,2})?$/.test(value);
        setIsValid(isValidSalary || value === "");
        setEmployeeSalaries((prev) => ({
          ...prev,
          [employeeId]: value,
        }));
      };

      const handleSaveSalary = (employeeId) => {
        const salary = employeeSalaries[employeeId];
        if (salary && isValid) {
          // Show an alert before making the API call
          toast({
            style: {
              backgroundColor: "rgba(255, 115, 0, 0.9)", // Fundal opac
              color: "black", // Textul va fi negru pentru contrast
              borderRadius: "9px", // Colțuri rotunjite
              fontWeight: "bold", // Textul va fi îngroșat (bold)
            },
            description: "Salariu modificat cu succes",
          });
          
          
          // Now, perform the API call to update the salary
          fetch("http://localhost:9000/update-salary", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              Id: employeeId,
              Salariu: salary,
            }),
          })
            .then((response) => {
              if (response.ok) {
                return response.json(); // You can handle the response if needed
              } else {
                throw new Error('Failed to update salary');
              }
            })
            .then((data) => {
              console.log("Salary updated successfully", data);
              alert(`Salary updated successfully for employee ID ${employeeId}`);
            })
            .catch((error) => {
              console.error("Error updating salary:", error);
              alert("Error updating salary. Please try again.");
            });
        }
      };
      const deleteexcursionist = async (id) => {
        try {
          // Make the POST request to delete the excursionist
          const response = await fetch('http://localhost:9000/deleteExcursionist', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              Excursionisti_ID: id,
            }),
          });
    
          const data = await response.json();
    
          // If the deletion was successful, update the state to remove the deleted employee from the list
          if (response.ok) {
            // Filter out the deleted employee from the employees array
            setEmployees((prevEmployees) =>
              prevEmployees.filter((employee) => employee.Excursionisti_ID !== id)
            );
            toast({
              style: {
                backgroundColor: "rgba(255, 115, 0, 0.9)", // Fundal opac
                color: "black", // Textul va fi negru pentru contrast
                borderRadius: "9px", // Colțuri rotunjite
                fontWeight: "bold", // Textul va fi îngroșat (bold)
              },
              description: "Excursionist șters cu succes",
            });
            
          } else {
            alert("Failed to delete the employee.");
          }
        } catch (error) {
          console.error("Error deleting employee:", error);
          alert("An error occurred while deleting the employee.");
        }
      };
      const deleteOrganizatori = async (id) => {
        try {
          // Make the POST request to delete the organizer
          const response = await fetch('http://localhost:9000/deleteOrganizatori', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              Organizator_ID: id,
            }),
          });
    
          const data = await response.json();
    
          // If the deletion was successful, update the state to remove the deleted organizer from the list
          if (response.ok) {
            // Filter out the   deleted organizer from the organizers array
           
    
            // Show success toast
            toast({
              style: {
                backgroundColor: "rgba(255, 115, 0, 0.9)", // Fundal opac
                color: "black", // Textul va fi negru pentru contrast
                borderRadius: "9px", // Colțuri rotunjite
                fontWeight: "bold", // Textul va fi îngroșat (bold)
              },
              description: "Organizer șters cu succes",
            });
          } else {
            alert("Failed to delete the organizer.");
          }
        } catch (error) {
          console.error("Error deleting organizer:", error);
          alert("An error occurred while deleting the organizer.");
        }
      };  
      const deleteEvent = async (eventId) => {
        
        try {
          const response = await fetch(`http://localhost:9000/events-delete`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ id: eventId }),
          });
      
          if (response.ok) {
            // Update the events state by filtering out the deleted event
            setEvents((prevEvents) => ({
              past: prevEvents.past.filter((event) => event.Eveniment_Id !== eventId),
              ongoing: prevEvents.ongoing.filter((event) => event.Eveniment_Id !== eventId),
              upcoming: prevEvents.upcoming.filter((event) => event.Eveniment_Id !== eventId),
            }));
            toast({
                  
              style: {
                backgroundColor: "rgba(255, 115, 0, 0.9)", // fundal opac
                color: "black", // text alb pentru contrast
                borderRadius: "9px", // colțuri rotunjite
                fontWeight: "bold",
                
              },
              description: "Eveniment șters cu succes",
            })
          } else {
            alert("Failed to delete the event. Please try again.");
          }
        } catch (error) {
          console.error("Error deleting event:", error);
          alert("An error occurred while deleting the event.");
        }
      };
      
      const renderHorizontalEventList = (eventList) => (
        <ScrollArea className="h-[200px] w-full whitespace-nowrap rounded-md border">
          <div className="flex w-max space-x-4 p-4">
            {eventList.map((event) => (
              <div
                key={event.Eveniment_Id}
                className="shrink-0 w-[335px] bg-gray-100 rounded-md p-4 shadow-md"
              >
                <p>
                  <strong>Nume:</strong> {event.Nume_eveniment}
                </p>
                <p>
                  <strong>Data Început:</strong> {new Date(event.Data_Inceput).toLocaleString()}
                </p>
                <p>
                  <strong>Data Final:</strong> {new Date(event.Data_Final).toLocaleString()}
                </p>
                <div className="flex space-x-2 mt-2">
                  <PopoverDemo id={event.Eveniment_Id}/>
                  <CopyEventDialog event={event} />
                  <Button
                    variant="destructive"
                    onClick={
                      
                      () => deleteEvent(event.Eveniment_Id)}
                    
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      );
      const handleBeforeChange = (e) => setBefore(e.target.value);
      const handleNowChange = (e) => setNow(e.target.value);
      const handleThenChange = (e) => setThen(e.target.value);
      return (
        <Tabs defaultValue="employees" className="w-[800px] mx-auto mt-[-275px]">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="employees">Excursioniști</TabsTrigger>
            <TabsTrigger value="placeholder">Angajați</TabsTrigger>
            <TabsTrigger value="events">Evenimente</TabsTrigger>
          </TabsList>
          <TabsContent value="employees">
            <Card>
              <CardHeader>
                <CardTitle>Excursioniști</CardTitle>
                <CardDescription>Lista tuturor excursioniștilor</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[399px] rounded-md border">
                  <div className="p-4 space-y-4">
                    {employees.map((employee) => (
                      <React.Fragment key={employee.Excursionisti_ID}>
                        <div className="flex items-center justify-between text-sm space-y-1">
                          <div>
                            <p>
                              <strong>Nume:</strong> {employee.nume_complet}
                            </p>
                            <p>
                              <strong>Vârstă:</strong> {employee.varsta}
                            </p>
                            <p>
                              <strong>CNP:</strong> {employee.cnp}
                            </p>
                            <p>
                              <strong>Telefon:</strong> {employee.nr_telefon}
                            </p>
                            <p>
                              <strong>Email:</strong> {employee.email}
                            </p>
                          </div>
                          <Button
                            variant="destructive"
                            onClick={() => deleteexcursionist(employee.Excursionisti_ID)}
                          >
                            Delete
                          </Button>
                        </div>
                        <Separator className="my-2" />
                      </React.Fragment>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="placeholder">
            <Card>
              <CardHeader>
                <CardTitle>Angajați</CardTitle>
                <CardDescription>Lista tuturor angajaților</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[399px] rounded-md border">
                  <div className="p-4 space-y-4">
                    {realemployees.map((realemployee) => (
                      <React.Fragment key={realemployee.Organizatori_Id}>
                        <div className="flex items-center justify-between text-sm space-y-1">
                          <div>
                            <p>
                              <strong>Nume:</strong> {realemployee.nume_complet}
                            </p>
                            <p>
                              <strong>Vârstă:</strong> {realemployee.varsta}
                            </p>
                            <p>
                              <strong>CNP:</strong> {realemployee.cnp}
                            </p>
                            <p>
                              <strong>Telefon:</strong> {realemployee.nr_telefon}
                            </p>
                            <p>
                              <strong>Email:</strong> {realemployee.email}
                            </p>
                          </div>
                          <div className="flex flex-col space-y-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline"
                                
                                >Modifica salariul</Button>
                              </DialogTrigger>
                              <DialogContent className="sm:max-w-[425px] bg-gray-800 text-white">
                                <DialogHeader>
                                  <DialogTitle>Modificare Salariu</DialogTitle>
                                  <DialogDescription>
                                    Modificați salariul aici și salvați.
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                  <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="Salariu" className="text-right">
                                      Salariu
                                    </Label>
                                    <Input
                                      id="Salariu"
                                      value={employeeSalaries[realemployee.Organizatori_Id] || ""}
                                      onChange={(e) =>
                                        handleSalaryChange(e, realemployee.Organizatori_Id)
                                      }
                                      className="col-span-3"
                                      placeholder="Introduceți salariul"
                                    />
                                    {!isValid && (
                                      <p className="text-red-500 text-sm col-span-4">
                                        Format salariu invalid. Introduceți un număr cu până la 2 zecimale.
                                      </p>
                                    )}
                                  </div>
                                </div>
                                <DialogFooter>
                                  <Button
                                    type="submit"
                                    disabled={!isValid}
                                    onClick={() =>
                                      handleSaveSalary(realemployee.Organizatori_Id)
                                    }
                                  >
                                    Salvează modificările
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                            <Button
                              variant="destructive"
                              onClick={() => deleteOrganizatori(realemployee.Organizatori_Id)}
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                        <Separator className="my-2" />
                      </React.Fragment>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="events">
          <Card>
      <CardHeader>
        <CardTitle>Evenimente</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">Evenimente Trecute</h3>
            <input value={before} onChange={handleBeforeChange} placeholder="Filter events before..." />
            {renderHorizontalEventList(events.past)}
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Evenimente Curente</h3>
            <input value={now} onChange={handleNowChange} placeholder="Filter current events..." />
            {renderHorizontalEventList(events.ongoing)}
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Evenimente Viitoare</h3>
            <input value={then} onChange={handleThenChange} placeholder="Filter upcoming events..." />
            {renderHorizontalEventList(events.upcoming)}
          </div>
        </div>
      </CardContent>
    </Card>
          </TabsContent>
        </Tabs>
      );
    }
