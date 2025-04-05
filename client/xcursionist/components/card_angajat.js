"use client";

import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast"  
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// DatePickerDemo component for selecting the date
  export function DatePickerDemo({ setDate, date }) {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn(
              "w-[280px] justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon />
            {date ? format(date, "PPP") : <span>Pick a date</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            initialFocus
            minDate={new Date()} // Ensure the date is after today
          />
        </PopoverContent>
      </Popover>
    );
  }

export function CreateAngajatForm() {
  const [nume, setNume] = React.useState("");
  const [sex, setSex] = React.useState("");
  const [numarTelefon, setNumarTelefon] = React.useState("");
  const [cnp, setCnp] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [varsta, setVarsta] = React.useState("");
  const [salariu, setSalariu] = React.useState("");
  const [adresaAngajare, setAdresaAngajare] = React.useState(null);
  const [errorMessage, setErrorMessage] = React.useState("");
  const {toast} = useToast()
  // Handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault();

    // Validate the fields
    if (varsta <= 0 || isNaN(varsta)) {
      setErrorMessage("Varsta trebuie sa fie un numar pozitiv.");
      return;
    }

    if (!email.includes("@")) {
      setErrorMessage("Adresa de email nu este valida.");
      return;
    }

    if (!/^\d+$/.test(numarTelefon)) {
      setErrorMessage("Numarul de telefon trebuie sa contina doar cifre.");
      return;
    }

    if (cnp.length !== 13) {
      setErrorMessage("CNP-ul trebuie sa aiba 13 caractere.");
      return;
    }

    if (!adresaAngajare) {
      setErrorMessage("Trebuie sa selectati o data pentru adresa de angajare.");
      return;
    }

    // Prepare the data to be sent
    const formData = {
      nume,
      sex,
      numarTelefon,
      cnp,
      email,
      varsta,
      salariu,
      adresaAngajare: format(adresaAngajare, "yyyy-MM-dd"), // Send date in the required format
    };

    try {
      // Send the data to the backend via fetch
      const response = await fetch("http://localhost:9000/createAngajat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      
      console.log(response);
      if (response.ok) {
        toast({
          style: {  
            backgroundColor: "rgba(255, 115, 0, 0.9)", // Fundal opac
            color: "black", // Textul va fi negru pentru contrast
            borderRadius: "9px", // Colțuri rotunjite
            fontWeight: "bold", // Textul va fi îngroșat (bold)
          },
          description: "Angajatul a fost adăugat in baza de date",
        });
        
      } else {
        setErrorMessage("Eroare la crearea contului.");
      }
    } catch (error) {
      setErrorMessage("A aparut o eroare la conectarea la server.");
    }
  };

  return (
    <Card className="w-[650px] mx-auto -mt-[250px]">
      <CardHeader>
        <CardTitle>Adauga angajat</CardTitle>
        <CardDescription>Completeaza informatiile pentru a adauga angajatul.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4 w-full">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="nume">Nume</Label>
              <Input
                id="nume"
                placeholder="Introduceti numele"
                value={nume}
                onChange={(e) => setNume(e.target.value)}
                required
              />
            </div>

            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="sex">Sex</Label>
              <Select value={sex} onValueChange={setSex}>
                <SelectTrigger id="sex">
                  <SelectValue placeholder="Selecteaza sexul" />
                </SelectTrigger>
                <SelectContent position="popper">
                  <SelectItem value="M">Masculin</SelectItem>
                  <SelectItem value="F">Feminin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="numarTelefon">Numar de telefon</Label>
              <Input
                id="numarTelefon"
                type="tel"
                placeholder="Introduceti numarul de telefon"
                value={numarTelefon}
                onChange={(e) => setNumarTelefon(e.target.value)}
                required
              />
            </div>

            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="cnp">CNP</Label>
              <Input
                id="cnp"
                type="text"
                placeholder="Introduceti CNP-ul"
                value={cnp}
                onChange={(e) => setCnp(e.target.value)}
                required
              />
            </div>

            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Introduceti adresa de email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="varsta">Varsta</Label>
              <Input
                id="varsta"
                type="number"
                placeholder="Introduceti varsta"
                value={varsta}
                onChange={(e) => setVarsta(e.target.value)}
                required
              />
            </div>

            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="salariu">Salariu</Label>
              <Input
                id="salariu"
                type="number"
                placeholder="Introduceti salariul"
                value={salariu}
                onChange={(e) => setSalariu(e.target.value)}
                required
              />
            </div>

            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="adresaAngajare">Data Adresei de Angajare</Label>
              <DatePickerDemo setDate={setAdresaAngajare} date={adresaAngajare} />
            </div>

            {errorMessage && (
              <div className="text-red-500 text-sm mt-2 col-span-2">{errorMessage}</div>
            )}
          </div>
          <CardFooter className="flex justify-between mt-4">
            <Button type="submit">Adauga angajat</Button>
          </CardFooter>
        </form>
      </CardContent>
    </Card>
  );
}
