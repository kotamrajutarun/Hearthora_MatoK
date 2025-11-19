import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import { Footer } from "@/components/Footer";
import Home from "@/pages/Home";
import Providers from "@/pages/Providers";
import ProviderProfile from "@/pages/ProviderProfile";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import ProviderDashboard from "@/pages/ProviderDashboard";
import InstantBrowse from "@/pages/InstantBrowse";
import Addresses from "@/pages/Addresses";
import MyBookings from "@/pages/MyBookings";
import PriceCards from "@/pages/provider/PriceCards";
import AvailabilityPage from "@/pages/provider/Availability";
import Jobs from "@/pages/provider/Jobs";
import Placeholder from "@/pages/Placeholder";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/providers" component={Providers} />
      <Route path="/provider/price-cards" component={PriceCards} />
      <Route path="/provider/availability" component={AvailabilityPage} />
      <Route path="/provider/jobs" component={Jobs} />
      <Route path="/provider/:id" component={ProviderProfile} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/dashboard/provider" component={ProviderDashboard} />
      <Route path="/instant-browse" component={InstantBrowse} />
      <Route path="/my-addresses" component={Addresses} />
      <Route path="/my-bookings" component={MyBookings} />
      <Route path="/success-stories">
        {() => <Placeholder title="Success Stories" description="Read inspiring stories from our students and tutors" />}
      </Route>
      <Route path="/write-review">
        {() => <Placeholder title="Write a Review" description="Share your experience with tutors and services" />}
      </Route>
      <Route path="/help">
        {() => <Placeholder title="Help Center" description="Find answers to frequently asked questions" />}
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Layout>
            <Router />
          </Layout>
          <Toaster />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
