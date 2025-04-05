import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/hooks/use-toast"
import { Separator } from "@/components/ui/separator"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from "@/components/ui/command";
import { Calendar, User } from "lucide-react";

export function CreateEventPage() {
    const [startTimeError, setStartTimeError] = useState('');
    const [eventName, setEventName] = useState('');
    const [startDate, setStartDate] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endDate, setEndDate] = useState('');
    const [endTime, setEndTime] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [selectedAttractions, setSelectedAttractions] = useState([]);
    const [selectedTransport, setSelectedTransport] = useState('');
    const [attractions, setAttractions] = useState([]);
    const [transports, setTransports] = useState([]);
    const [commandSearch, setCommandSearch] = useState('');
    const [events, setEvents] = useState([]);

    // New state for error messages
    const [startDateError, setStartDateError] = useState('');
    const [endDateError, setEndDateError] = useState('');
    const [eventNameError, setEventNameError] = useState('');
    const [transportError, setTransportError] = useState('');

    const [numeAtractie, setNumeAtractie] = useState('');
    const [descriereAtractie, setDescriereAtractie] = useState('');
    const [urlPoza, setUrlPoza] = useState('');
    const [previewPhoto, setPreviewPhoto] = useState(null);

   const {toast} = useToast()

    // Fetch attractions

    useEffect(() => {
        async function fetchAttractions() {
            try {
                const response = await fetch('http://localhost:9000/attractions');
                const data = await response.json();
                setAttractions(data);
            } catch (error) {
                console.error('Error fetching attractions:', error);
            }
        }

        fetchAttractions();
    }, []);

    // Fetch transports
    useEffect(() => {
        async function fetchTransports() {
            try {
                const response = await fetch('http://localhost:9000/transports');
                const data = await response.json();
                setTransports(data);
            } catch (error) {
                console.error('Error fetching transports:', error);
            }
        }

        fetchTransports();
    }, []);
    useEffect(() => {
        async function fetchEvents() {
            try {
                const response = await fetch('http://localhost:9000/events-show');
                const data = await response.json();
                setEvents(data);
            } catch (error) {
                console.error('Error fetching events:', error);
            }
        }
        fetchEvents();
    }, []);

    const handleAttractionSubmit = async (e) => {
        e.preventDefault();

        const attractionData = {
            Nume_Atractie: numeAtractie,
            Descriere_Atractie: descriereAtractie,
            URL_Poza: urlPoza,
        };

        // Log the request body to the console
        console.log('Attraction Data to be sent:', JSON.stringify(attractionData, null, 2));

        try {
            const response = await fetch('http://localhost:9000/createAttraction', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(attractionData),
            });

            const data = await response.json();
            console.log(data.success)
            if (response.ok) {
                // Reset form fields after successful creation
                setNumeAtractie('');
                setDescriereAtractie('');
                setUrlPoza('');
                setPreviewPhoto(null);
                toast({
                    style: {
                      backgroundColor: "rgba(255, 115, 0, 0.9)", // Fundal opac
                      color: "black", // Textul va fi negru pentru contrast
                      borderRadius: "9px", // Colțuri rotunjite
                      fontWeight: "bold", // Textul va fi îngroșat (bold)
                    },
                    description: "Atracție creată cu succes",
                  });

                // Add the new attraction to the list of attractions
               
            }
        } catch (error) {
            console.error('Error submitting attraction:', error);
        }
    };

    const handleAttractionSelect = (attraction) => {
        // Check if the attraction is already in the selected list
        const isSelected = selectedAttractions.some(
            (selectedAttraction) => selectedAttraction.Atractii_Id === attraction.Atractii_Id
        );

        if (isSelected) {
            // If it's already selected, remove it from the list
            setSelectedAttractions(
                selectedAttractions.filter(
                    (selectedAttraction) => selectedAttraction.Atractii_Id !== attraction.Atractii_Id
                )
            );
        } else {
            // If it's not selected, add it to the list
            setSelectedAttractions([...selectedAttractions, attraction]);
        }
    };


    const handlePreviewPhoto = () => {
        if (urlPoza.trim()) {
            setPreviewPhoto(urlPoza);
        } else {
            alert('Please enter a valid URL for the photo.');
        }
    };

    // Handle form submission with date validation
    const handleSubmit = async (e) => {
        e.preventDefault();
    
        const currentDate = new Date().toISOString().split("T")[0]; // Formats it as 'YYYY-MM-DD'
    
        let isValid = true;
    
        // Reset errors
        setStartDateError('');
        setEndDateError('');
        setStartTimeError('');
        setEventNameError('');
        setTransportError('');
    
        // Validate Event Name
        if (!eventName) {
            setEventNameError('Event name cannot be empty.');
            isValid = false;
        }
    
        // Validate Start Date
        if (startDate < currentDate) {
            setStartDateError('Start date must be later than the current date.');
            isValid = false;
        }
    
        // Validate Start Time (if necessary)
        if (!startTime) {
            setStartTimeError('Start time cannot be empty.');
            isValid = false;
        }
    
        // Validate End Date
        if (endDate < currentDate) {
            setEndDateError('End date must be later than the current date.');
            isValid = false;
        }
    
        // Validate Start Date > End Date
        if (startDate > endDate) {
            setEndDateError('End date must be later than the start date.');
            isValid = false;
        }
    
        // Validate Transport Selection
        if (!selectedTransport) {
            setTransportError('You must select a transport option.');
            isValid = false;
        }
    
        if (!isValid) return;
    
        // Combine the date and time into DateTime format
        const startDateTime = new Date(`${startDate}T${startTime}`);
        const endDateTime = new Date(`${endDate}T${endTime}`);
    
        const eventData = {
            eventName,
            startDateTime: startDateTime.toISOString(),
            endDateTime: endDateTime.toISOString(),
            description,
            price,
            attractions: selectedAttractions.map(attraction => attraction.Atractii_Id), // Extract only the Atractii_Id
            transport_id: transports.find(transport => transport.Mijloc_Transport === selectedTransport)?.Transport_ID, // Get the transport ID
        };
    
        console.log("Event Data to be sent:", JSON.stringify(eventData, null, 2));
    
        try {
            const response = await fetch('http://localhost:9000/createEvent', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(eventData),
            });
    
            // Check if the response is successful
            if (response.ok) {
                toast({
                    style: {
                      backgroundColor: "rgba(255, 115, 0, 0.9)", // Fundal opac
                      color: "black", // Textul va fi negru pentru contrast
                      borderRadius: "9px", // Colțuri rotunjite
                      fontWeight: "bold", // Textul va fi îngroșat (bold)
                    },
                    description: "Eveniment creat cu succes",
                  });
                // Reset form fields
                setEventName('');
                setStartDate('');
                setStartTime('');
                setEndDate('');
                setEndTime('');
                setDescription('');
                setPrice('');
                setSelectedAttractions([]);
                setSelectedTransport('');
            } else {
                alert('Error creating event');
            }
        } catch (error) {
            console.error('Error submitting event:', error);
        }
    };
    
   
    const handleDeleteAttraction = async (attractionId) => {
        const requestBody = { id: attractionId };
        console.log('Deleting Attraction with body:', JSON.stringify(requestBody, null, 2));
        try {
            const response = await fetch('http://localhost:9000/attractions-delete', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
            });
            if (response.ok) {
                setAttractions(attractions.filter(attraction => attraction.Atractii_Id !== attractionId));
                toast({
                    style: {
                      backgroundColor: "rgba(255, 115, 0, 0.9)", // Fundal opac
                      color: "black", // Textul va fi negru pentru contrast
                      borderRadius: "9px", // Colțuri rotunjite
                      fontWeight: "bold", // Textul va fi îngroșat (bold)
                    },
                    description: "Atractie ștearsă cu succes",
                  });
            } else {
                alert('Error deleting attraction.');
            }
        } catch (error) {
            console.error('Error deleting attraction:', error);
        }
    };
    return (
        <Tabs defaultValue="createEvent" className="w-[800px] mx-auto mt-[-275px]">
            <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="createEvent" className="text-black px-4 py-2 rounded-lg active:bg-light-blue-500 data-[state=active]:bg-light-blue-500 data-[state=active]:font-bold">
                    Create Event
                </TabsTrigger>
                <TabsTrigger value="createAttraction" className="text-black px-4 py-2 rounded-lg active:bg-light-blue-500 data-[state=active]:bg-light-blue-500 data-[state=active]:font-bold">
                    Create Attraction
                </TabsTrigger>
                <TabsTrigger value="StergeAttraction" className="text-black px-4 py-2 rounded-lg active:bg-light-blue-500 data-[state=active]:bg-light-blue-500 data-[state=active]:font-bold">
                    Sterge atractii
                </TabsTrigger>
            </TabsList>

            {/* Create Event Tab */}
            <TabsContent value="createEvent">
                <Card>
                    <CardHeader>
                        <CardTitle>Create Event</CardTitle>
                        <CardDescription>Fill in the details to create a new event.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-1">
                            <Label htmlFor="eventName">Event Name</Label>
                            <Input
                                id="eventName"
                                value={eventName}
                                onChange={(e) => setEventName(e.target.value)}
                                required
                                className={eventNameError ? "border-red-500" : ""}
                            />
                            {eventNameError && <p className="text-red-500 text-sm">{eventNameError}</p>}
                        </div>

                        <div className="space-y-1">
                            <Label htmlFor="startDate">Start Date</Label>
                            <Input
                                id="startDate"
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                required
                                className={startDateError ? "border-red-500" : ""}
                            />
                            <Label htmlFor="startTime">Start Time</Label>
                            <Input
                                id="startTime"
                                type="time"
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                                required
                                className={startTimeError ? "border-red-500" : ""}
                            />
                            {startDateError && <p className="text-red-500 text-sm">{startDateError}</p>}
                        </div>

                        <div className="space-y-1">
                            <Label htmlFor="endDate">End Date</Label>
                            <Input
                                id="endDate"
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                required
                                className={endDateError ? "border-red-500" : ""}
                            />
                            <Label htmlFor="endTime">End Time</Label>
                            <Input
                                id="endTime"
                                type="time"
                                value={endTime}
                                onChange={(e) => setEndTime(e.target.value)}
                                required
                                className={endDateError ? "border-red-500" : ""}
                            />
                            {endDateError && <p className="text-red-500 text-sm">{endDateError}</p>}
                        </div>

                        <div className="space-y-1">
                            <Label htmlFor="description">Description</Label>
                            <textarea
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full h-32 px-3 py-2 border rounded-md focus:outline-none resize-none overflow-hidden"
                                placeholder="Adaugă o descriere "
                                required
                            ></textarea>
                        </div>

                        <div className="space-y-1">
                            <Label htmlFor="price">Price</Label>
                            <Input
                                id="price"
                                type="number"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-1 pb-4">
                            <Label>Attractions</Label>
                            <Command>
                                <CommandInput
                                    onChange={(e) => setCommandSearch(e.target.value)}
                                    placeholder="Search attractions"
                                />
                                <CommandList>
                                    <CommandEmpty>No results found.</CommandEmpty>
                                    <CommandGroup heading="Suggestions">
                                        {attractions
                                            .filter((attraction) =>
                                                attraction.Nume_Atractie
                                                    .toLowerCase()
                                                    .includes(commandSearch.toLowerCase())
                                            )
                                            .map((attraction) => (
                                                <CommandItem
                                                    key={attraction.Atractii_Id}
                                                    onSelect={() => handleAttractionSelect(attraction)}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedAttractions.includes(attraction)}
                                                        readOnly
                                                    />
                                                    <span>{attraction.Nume_Atractie}</span>
                                                </CommandItem>
                                            ))}
                                    </CommandGroup>
                                </CommandList>
                            </Command>
                        </div>

                        <div className="space-y-1">
                            <select
                                id="transport"
                                value={selectedTransport}
                                onChange={(e) => setSelectedTransport(e.target.value)}
                                required
                                className={transportError ? "border-red-500" : ""}
                            >
                                <option value="">Select transport</option>
                                {transports.map((transport) => (
                                    <option
                                        key={transport.Transport_ID}
                                        value={transport.Mijloc_Transport}
                                    >
                                        {transport.Mijloc_Transport} (Capacitate: {transport.Capacitate} - Firma: {transport.Nume_Companie})
                                    </option>
                                ))}
                            </select>
                            {transportError && <p className="text-red-500 text-sm">{transportError}</p>}
                        </div>

                    </CardContent>
                    <CardFooter>
                        <Button onClick={handleSubmit}>Create Event</Button>
                    </CardFooter>
                </Card>
            </TabsContent>

            {/* Create Attraction Tab (Placeholder) */}
            <TabsContent value="createAttraction">
                <Card>
                    <CardHeader>
                        <CardTitle>Create Attraction</CardTitle>
                        <CardDescription>Add a new attraction.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <form onSubmit={handleAttractionSubmit}>
                            <div className="space-y-1">
                                <Label htmlFor="numeAtractie">Nume Atractie</Label>
                                <Input
                                    id="numeAtractie"
                                    value={numeAtractie}
                                    onChange={(e) => setNumeAtractie(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="space-y-1">
                                <Label htmlFor="descriereAtractie">Descriere Atractie</Label>
                                <Input
                                    id="descriereAtractie"
                                    value={descriereAtractie}
                                    onChange={(e) => setDescriereAtractie(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="space-y-1">
                                <Label htmlFor="urlPoza">URL Poza</Label>
                                <div className="flex items-center space-x-2">
                                    <Input
                                        id="urlPoza"
                                        value={urlPoza}
                                        onChange={(e) => setUrlPoza(e.target.value)}
                                        required
                                    />
                                    <Button type="button" onClick={handlePreviewPhoto}>
                                        See Photo
                                    </Button>
                                </div>
                            </div>

                            {previewPhoto && (
                                <div className="mt-4">
                                    <img
                                        src={previewPhoto}
                                        alt="URL Incorect"
                                        className="border rounded-md max-h-64"
                                    />
                                </div>
                            )}

                            <div className="pt-4">
                                <Button type="submit">Create Attraction</Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="StergeAttraction">
                <Card>
                    <CardHeader>

                    </CardHeader>
                    <CardContent className="flex justify-center">
                        {/* Scrollable Events Section */}


                        {/* Scrollable Attractions Section */}
                        <ScrollArea className="h-[400px] w-full rounded-md border">
                            <div className="p-4">
                                <h4 className="mb-4 text-sm font-medium leading-none">Attractions</h4>
                                {attractions.map((attraction) => (
                                    <div
                                        key={attraction.Atractii_Id}
                                        className="flex justify-between items-center mb-2"
                                    >
                                        <span className="text-sm">{attraction.Nume_Atractie}</span>
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => handleDeleteAttraction(attraction.Atractii_Id)}
                                        >
                                            Delete
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>

                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    );
}
