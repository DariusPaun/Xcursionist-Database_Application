import * as React from "react";
import { Button } from "@/components/ui/button";
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
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function CreateAccountForm() {
  const [nume, setNume] = React.useState("");
  const [sex, setSex] = React.useState("");
  const [numarTelefon, setNumarTelefon] = React.useState("");
  const [cnp, setCnp] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [varsta, setVarsta] = React.useState("");
  const [parola, setParola] = React.useState("");
  const [rescrieParola, setRescrieParola] = React.useState("");
  const [errorMessage, setErrorMessage] = React.useState("");
  const {toast} = useToast()
  // Handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault();

    // Validate the fields
    if (parola !== rescrieParola) {
      setErrorMessage("Parolele nu se potrivesc.");
      return;
    }

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

    // Prepare the data to be sent
    const formData = {
      nume,
      sex,
      numarTelefon,
      cnp,
      email,
      varsta,
      parola
    };

    try {
      // Send the data to the backend via fetch
      const response = await fetch("http://localhost:9000/createAccount", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      

      if (response.ok) {
        try{
          toast({
            style: {  
              backgroundColor: "rgba(255, 115, 0, 0.9)", // Fundal opac
              color: "black", // Textul va fi negru pentru contrast
              borderRadius: "9px", // Colțuri rotunjite
              fontWeight: "bold", // Textul va fi îngroșat (bold)
            },
            description: "Contul d-voastră a fost creat cu succes",
          });
        } catch(error){
          setErrorMessage("toast")
        }
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
        <CardTitle>Creeaza cont</CardTitle>
        <CardDescription>Completeaza informatiile pentru a crea contul.</CardDescription>
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
                    <SelectItem value="M">Masculin</SelectItem> {/* This is displayed as "Masculin" in the UI */}
                    <SelectItem value="F">Feminin</SelectItem> {/* This is displayed as "Feminin" in the UI */}
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
              <Label htmlFor="parola">Parola</Label>
              <Input
                id="parola"
                type="password"
                placeholder="Introduceti parola"
                value={parola}
                onChange={(e) => setParola(e.target.value)}
                required
              />
            </div>

            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="rescrieParola">Rescrie parola</Label>
              <Input
                id="rescrieParola"
                type="password"
                placeholder="Rescrieti parola"
                value={rescrieParola}
                onChange={(e) => setRescrieParola(e.target.value)}
                required
              />
            </div>

            {errorMessage && (
              <div className="text-red-500 text-sm mt-2 col-span-2">{errorMessage}</div>
            )}
          </div>
          <CardFooter className="flex justify-between mt-4">
            <Button type="submit">Creeaza cont</Button>
          </CardFooter>
        </form>
      </CardContent>
    </Card>
  );
}
