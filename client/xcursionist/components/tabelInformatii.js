"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function StatisticsPeople() {
  const [dataPeople, setDataPeople] = React.useState([]);
  const [minAmount, setMinAmount] = React.useState("");
  const [maxAmount, setMaxAmount] = React.useState("");

  // Funcția care se declanșează doar la apăsarea butonului "Send"
  const handleSendRequest = () => {
    const queryMin = minAmount || "-1";
    const queryMax = maxAmount || Number.MAX_SAFE_INTEGER.toString();

    fetch(`http://localhost:9000/api?suma_minima=${queryMin}&suma_maxima=${queryMax}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! Status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        setDataPeople(data);
      })
      .catch((err) => console.error("Error fetching data:", err));
  };

  // useEffect pentru a apela handleSendRequest la încărcarea componentei
  React.useEffect(() => {
    handleSendRequest();
  }, []); // Array-ul gol indică faptul că efectul trebuie să ruleze o singură dată la montarea componentei

  return (
    <div className="w-full">
      <div className="flex flex-col py-4 space-y-4">
        <div className="flex items-center space-x-4">
          <div className="flex flex-col" style={{ width: "200px" }}>
            <label
              htmlFor="minAmount"
              className="text-sm font-medium text-gray-700"
            >
              Limita inferioară (suma minimă)
            </label>
            <Input
              id="minAmount"
              placeholder="Introduceți suma minimă"
              value={minAmount}
              onChange={(e) => {
                const inputValue = e.target.value;
                if (/^\d*$/.test(inputValue)) {
                  setMinAmount(inputValue);
                }
              }}
              className="mt-1"
            />
          </div>

          <div className="flex flex-col">
            <label
              htmlFor="maxAmount"
              className="text-sm font-medium text-gray-700"
            >
              Limita superioară (suma maximă)
            </label>
            <div className="flex items-center space-x-4 mt-1">
              <Input
                id="maxAmount"
                placeholder="Introduceți suma maximă"
                value={maxAmount}
                onChange={(e) => {
                  const inputValue = e.target.value;
                  if (/^\d*$/.test(inputValue)) { // Permite doar cifre
                    setMaxAmount(inputValue);
                  }
                }}
                className="max-w-sm"
              />

              <Button
                onClick={handleSendRequest}
                className="px-4 py-2 bg-blue-500 text-white rounded-md"
              >
                Send
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Table className="shadow-lg rounded-lg bg-gray-300">
        <TableHeader>
          <TableRow className="bg-gray-800 text-white">
            <TableHead>Nume</TableHead>
            <TableHead>Varsta</TableHead>
            <TableHead>Sex</TableHead>
            <TableHead>Numar excursii</TableHead>
            <TableHead>Bani Cheltuiti</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {dataPeople.map((person, index) => (
            <TableRow
              key={index}
              className={`hover:bg-gray-200 transition-all duration-200 ${index % 2 === 0 ? "bg-gray-300" : "bg-gray-300"}`}
            >
              <TableCell>{person.Nume_Complet}</TableCell>
              <TableCell>{person.varsta}</TableCell>
              <TableCell>{person.SEX}</TableCell>
              <TableCell>{person.Nr_excursii}</TableCell>
              <TableCell>{person.Bani_cheltuiti}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
