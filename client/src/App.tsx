import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import CategorySelection from "@/pages/CategorySelection";
import Game from "@/pages/Game";
import MemoryGame from "@/pages/MemoryGame";
import NumberSequence from "@/pages/NumberSequence";
import Crossword from "@/pages/Crossword";
import { preloadSounds } from "./lib/sound";

function App() {
  // Preload sounds when app initializes
  preloadSounds();
  
  return (
    <QueryClientProvider client={queryClient}>
      <Switch>
        <Route path="/" component={CategorySelection} />
        <Route path="/game/:categoryId" component={Game} />
        <Route path="/memory/:id" component={MemoryGame} />
        <Route path="/number/:id" component={NumberSequence} />
        <Route path="/crossword/:id" component={Crossword} />
        <Route component={NotFound} />
      </Switch>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
