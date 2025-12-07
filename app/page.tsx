"use client";

import BehumanLogo from "@/components/BehumanLogo";
import { Github } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <main className="min-h-screen relative flex flex-col bg-background overflow-hidden">

      {/* Soft background shapes */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-72 h-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-[-10%] right-[-10%] w-80 h-80 rounded-full bg-accent/10 blur-3xl" />
        <div className="absolute top-1/2 left-1/4 w-64 h-64 rounded-full bg-muted/20 blur-2xl" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 text-center">

        {/* Logo */}
        <div className="flex justify-center mb-6">
          <BehumanLogo size={96} />
        </div>

        {/* Headline */}
        <h1 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight mb-6 max-w-3xl">
          Humanos Digitales para cuidar el bienestar de tus colaboradores.
        </h1>

        {/* Subheadline */}
        <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl mb-10">
          Aumenta la productividad, baja la rotación y multiplica el retorno de inversión.
        </p>

        {/* CTA Buttons */}
        <div className="flex gap-4">
          <Button variant="outline" size="lg" asChild>
            <a href="/login">Iniciar sesión</a>
          </Button>

          <Button size="lg" asChild>
            <a href="/register">Registrarse</a>
          </Button>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 w-full border-t border-border py-4">
        <div className="mx-auto flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <a
            href="https://github.com/jl-tavera/BeHuman"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 hover:text-foreground transition-colors"
          >
            <Github className="w-4 h-4" />
            <span>Open-source en GitHub</span>
          </a>
        </div>
      </footer>
    </main>
  );
}
