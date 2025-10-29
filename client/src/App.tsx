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
import Placeholder from "@/pages/Placeholder";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/providers" component={Providers} />
      <Route path="/provider/:id" component={ProviderProfile} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/dashboard/provider" component={ProviderDashboard} />
      <Route path="/ask-answer">
        {() => <Placeholder title="Ask & Answer" description="Get your questions answered by experts in the community" />}
      </Route>
      <Route path="/success-stories">
        {() => <Placeholder title="Success Stories" description="Read inspiring stories from our students and tutors" />}
      </Route>
      <Route path="/paid-courses">
        {() => <Placeholder title="Paid Courses" description="Explore our premium online courses" />}
      </Route>
      <Route path="/free-classes">
        {() => <Placeholder title="Free Classes" description="Join our free live classes and workshops" />}
      </Route>
      <Route path="/tuition-fees">
        {() => <Placeholder title="Tuition Fees Calculator" description="Calculate estimated tuition costs for different courses" />}
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
