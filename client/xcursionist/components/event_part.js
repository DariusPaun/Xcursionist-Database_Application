import * as React from "react";
import { useRouter } from 'next/navigation';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@radix-ui/react-select";

export function CardWithForm({ eventData }) {
  const router = useRouter();
  const [selectedTickets, setSelectedTickets] = React.useState(1);
  const [showLoginAlert, setShowLoginAlert] = React.useState(false);
  const [showExceededAlert, setShowExceededAlert] = React.useState(false);
  const [loginError, setLoginError] = React.useState("");
  const handleNavigation = (url, id) => {
    router.push(`${url}?id=${id}`);  // Only pass ID to the URL
  };
  // Handle change in selected number of tickets
  const handleSelectChange = (value) => {
    setSelectedTickets(Number(value));
  };

  // Handle "Cumpara" button click
  
  const handlePurchase = () => {
    const availableSeats = eventData.Capacitate - eventData.Ocupat;
    if (selectedTickets > availableSeats) {
      setShowExceededAlert(true); // Show exceeded tickets alert
    } else {
      setShowLoginAlert(true); // Show login alert
    }
  };

  const capacitate = eventData.Capacitate - eventData.Ocupat;
  const eventDate1list = `${eventData.Data_Inceput}`.split("T")[0].split("-");
  const eventDate2list = `${eventData.Data_final}`.split("T")[0].split("-");
  const eventDate1 = `${eventDate1list[2]}-${eventDate1list[1]}-${eventDate1list[0]}`;
  const eventDate2 = `${eventDate2list[2]}-${eventDate2list[1]}-${eventDate2list[0]}`;
  const eventHour1 = `${eventData.Data_Inceput}`.split("T")[1].split(":00.00")[0];
  const eventHour2 = `${eventData.Data_final}`.split("T")[1].split(":00.00")[0];

  // Handle login submission
  const handleLoginSubmit = async () => {
    const username = document.getElementById("full-name").value;
    const password = document.getElementById("password").value;
  
    // Fetch users data from backend
    const response = await fetch("http://localhost:9000/login");
    const users = await response.json();
  
    const user = users.find((user) => user.nume_complet === username && user.parola === password);
  
    if (user) {
      // User authenticated successfully, update their `Nr_excursii` and `bani_cheltuiti`
      const updatedUser = {
        nume_complet: user.nume_complet,
        parola: user.parola,
        Nr_excursii: user.Nr_excursii + 1,
        bani_cheltuiti: user.bani_cheltuiti + eventData.pret * selectedTickets,
        Excursionisti_Id: user.Excursionisti_Id,  // Add Excursionisti_Id here
      };
  
      // First, update the user data
      await fetch("http://localhost:9000/updateUser", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedUser),
      });
  
      console.log(`Login successful: ${user.nume_complet}`);
      setShowLoginAlert(false); // Close the login alert
  
      // Second, update the ocupatie (number of occupied seats) for the event
      const updatedOcupatie = {
        eventId: eventData.Eveniment_Id, // Ensure you're passing the event's unique ID
        newOcupat: eventData.Ocupat + selectedTickets, // Increase the "Ocupat" by the selected tickets
      };
  
      // Send request to update the event's occupancy
      await fetch("http://localhost:9000/update-ocupatie", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedOcupatie),
      });
  
      console.log(`Event occupancy updated for ${eventData.Nume_Eveniment}`);
  
      // Now send the purchase data (selectedTickets, eventId, and user.Excursionisti_Id)
      const purchaseData = {
        selectedTickets,
        eventId: eventData.Eveniment_Id,
        userId: user.Excursionisti_Id,
      };
  
      // Send request to create the purchase
      await fetch("http://localhost:9000/createPurchase", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(purchaseData),
      });
  
      console.log(`Purchase created for event ${eventData.Nume_Eveniment} by user ${user.nume_complet}`);
  
      // After updating the event, navigate to a new page
      router.push("/events"); // Replace with the path you want to navigate to
    } else {
      // User not found or invalid credentials
      setLoginError("Invalid username or password.");
    }
  };
  

  return (
    <>
      <Card className="w-[550px] mx-auto">
        <CardHeader>
          <CardTitle>{eventData.Nume_Eveniment}</CardTitle>
          <CardDescription>
            Locuri Disponibile: <span style={{ marginRight: "20px" }}></span>
            <b>{capacitate}</b>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form>
            <div className="flex justify-between items-center">
              <div className="grid w-full items-center gap-4">
                {/* Select number of tickets */}
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="framework">Selecteaza numarul de bilete</Label>
                  <Select value={selectedTickets.toString()} onValueChange={handleSelectChange}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Selecteaza" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="1">1</SelectItem>
                        <SelectItem value="2">2</SelectItem>
                        <SelectItem value="3">3</SelectItem>
                        <SelectItem value="4">4</SelectItem>
                        <SelectItem value="5">5</SelectItem>
                        <SelectItem value="6">6</SelectItem>
                        <SelectItem value="7">7</SelectItem>
                        <SelectItem value="8">8</SelectItem>
                        <SelectItem value="9">9</SelectItem>
                        <SelectItem value="10">10</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {/* Price Display */}
              <div className="text-xl font-bold text-[#333] mt-[-150px] mr-[100px] flex items-center">
                <span style={{ whiteSpace: "nowrap" }}>
                  {eventData.Nume_Companie}
                  <div className="text-sm" style={{ whiteSpace: "normal" }}>
                    {eventData.Mijloc_Transport}
                  </div>
                </span>
              </div>
              <div className="text-xl font-bold text-[#333] mt-[-155px] mr-[3px] flex items-center">
                <span
                  style={{ fontSize: "20px", fontWeight: "bold", color: "#333" }}
                >
                  Pret: {eventData.pret * selectedTickets}{" "}
                </span>
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button onClick={handlePurchase}>Cumpara</Button>
          <div
            style={{
              display: "flex",
              gap: "10px",
              fontSize: "13px",
              color: "#333",
              marginRight: "20px",
            }}
          >
            <div style={{ fontWeight: "bold" }}>
              Incepe pe data:
              <br />
              <div
                style={{
                  color: "#9E4400",
                  textShadow: "2px 2px 4px rgba(0, 0, 0, 0.5)",
                }}
              >
                {eventDate1}
              </div>
              <div>La ora:</div>
              <div
                style={{
                  color: "#9E4400",
                  textShadow: "2px 2px 4px rgba(0, 0, 0, 0.5)",
                }}
              >
                {eventHour1}
              </div>
            </div>
            <Separator orientation="vertical" className="my-4 border-l-2 border-black h-20 mt-[1px]" />
            <div style={{ fontWeight: "bold" }}>
              Se termina pe data:
              <br />
              <div
                style={{
                  color: "#9E4400",
                  textShadow: "2px 2px 4px rgba(0, 0, 0, 0.5)",
                }}
              >
                {eventDate2}
              </div>
              <div>La ora:</div>
              <div
                style={{
                  color: "#9E4400",
                  textShadow: "2px 2px 4px rgba(0, 0, 0, 0.5)",
                }}
              >
                {eventHour2}
              </div>
            </div>
          </div>
        </CardFooter>
      </Card>

      {/* Alert Dialog for Exceeded Tickets */}
      <AlertDialog open={showExceededAlert} onOpenChange={setShowExceededAlert}>
        <AlertDialogContent
          className="bg-gradient-to-br from-orange-600 via-red-600 to-black text-white rounded-lg shadow-xl p-6"
        >
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Numar de bilete excedent</AlertDialogTitle>
          </AlertDialogHeader>
          <div className="text-gray-300">
            Ati selectat un numar de bilete mai mare decat locurile disponibile ({capacitate}). Va rugam sa reduceti numarul de bilete.
          </div>
          <AlertDialogFooter>
            <Button
              className="bg-gray-700 text-white hover:bg-gray-600 transition-colors px-4 py-2 rounded-md"
              onClick={() => setShowExceededAlert(false)}
            >
              OK
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Alert Dialog with Login Form */}
      <AlertDialog open={showLoginAlert} onOpenChange={setShowLoginAlert}>
        <AlertDialogContent
          className="bg-gradient-to-br from-blue-600 via-purple-600 to-black text-white rounded-lg shadow-xl p-6"
        >
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Autentificare Necesara</AlertDialogTitle>
          </AlertDialogHeader>
          <div className="space-y-4">
            <Label htmlFor="full-name" className="text-gray-200">
              Nume Complet
            </Label>
            <Input id="full-name" placeholder="Introduceti numele complet" className="w-full" />
            <Label htmlFor="password" className="text-gray-200">
              Parola
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="Introduceti parola"
              className="w-full"
            />
            {loginError && <div className="text-red-500">{loginError}</div>}
          </div>
          <AlertDialogFooter>
            <Button
              className="bg-gray-700 text-white hover:bg-gray-600 transition-colors px-4 py-2 rounded-md ml-[100px]"
              onClick={() => setShowLoginAlert(false)}
            >
              Inapoi
            </Button>
            <Button
              className="bg-gray-700 text-white hover:bg-gray-600 transition-colors px-4 py-2 rounded-md"
              onClick={handleLoginSubmit}
            >
              Intra in cont
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
