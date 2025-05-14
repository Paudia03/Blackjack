// src/components/Home.jsx
import React from "react";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex flex-col">
      {/* Hero Section */}
      <header className="flex-1 flex flex-col justify-center items-center text-center px-4">
        <h1 className="text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-red-600 mb-6">
          Benvenuto a Blackjack Unipr
        </h1>
        <p className="text-xl text-gray-300 max-w-2xl">
         Gioca e tenta la fortuna!  
        </p>
      </header>

      {/* Game Selection Cards */}
      <section className="flex-none py-12 bg-gray-900">
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-8 px-4">
          {/* Blackjack Card */}
          <Link
            to="/blackjack"
            className="group block bg-gray-800 rounded-2xl p-6 hover:scale-105 transform transition"
          >
            <div className="flex items-center mb-4">
              <div className="bg-yellow-500 rounded-full p-3 group-hover:bg-yellow-600 transition">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M7 2h10a5 5 0 015 5v10a5 5 0 01-5 5H7a5 5 0 01-5-5V7a5 5 0 015-5z" />
                </svg>
              </div>
              <h3 className="ml-4 text-2xl font-bold text-white group-hover:text-yellow-400 transition">
                Blackjack
              </h3>
            </div>
            <p className="text-gray-400 mb-6">
              Sfida il banco e prova a raggiungere 21!
            </p>
            <button className="inline-block bg-yellow-500 text-black font-semibold py-2 px-4 rounded-full hover:bg-yellow-600 transition">
              Gioca Ora
            </button>
          </Link>

          {/* Profile Link Card */}
          <Link
            to="/profile"
            className="block bg-gray-800 rounded-2xl p-6 hover:scale-105 transform transition"
          >
            <div className="flex items-center mb-4">
              <div className="bg-blue-500 rounded-full p-3 hover:bg-blue-600 transition">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M5.121 17.804A13.937 13.937 0 0112 15c2.619 0 5.059.798 7.121 2.166M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path d="M19.428 15.341A8 8 0 003.857 15.34" />
                </svg>
              </div>
              <h3 className="ml-4 text-2xl font-bold text-white hover:text-blue-400 transition">
                Profilo & Storico
              </h3>
            </div>
            <p className="text-gray-400 mb-6">
              Qui puoi gestire il tuo profilo e vedere lo storico delle partite.
            </p>
            <button className="inline-block bg-blue-500 text-white font-semibold py-2 px-4 rounded-full hover:bg-blue-600 transition">
              Vai al Profilo
            </button>
          </Link>
        </div>
      </section>
    </div>
  );
}
