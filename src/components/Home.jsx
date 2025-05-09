// src/components/Home.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  const games = [
    {
      name: "Blackjack",
      description: "Sfida il banco e avvicinati a 21!",
      image: "/images/blackjack.jpg", // Assicurati di avere questa immagine in public/images
      path: "/blackjack",
    },
    // Aggiungerai qui altri giochi come Roulette, Poker, ecc.
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 text-white">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <h1 className="text-4xl font-bold text-center mb-12">Benvenuto al Casinò</h1>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {games.map((game) => (
            <div
              key={game.name}
              className="bg-gray-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition duration-300 cursor-pointer"
              onClick={() => navigate(game.path)}
            >
              <img
                src={game.image}
                alt={game.name}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h2 className="text-xl font-semibold mb-2">{game.name}</h2>
                <p className="text-gray-400">{game.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
