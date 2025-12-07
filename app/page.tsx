import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import BehumanLogo from '@/components/BehumanLogo';
import { Badge } from '@/components/ui/badge';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-secondary">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <BehumanLogo size={40} className="text-primary" />
            <div>
              <h1 className="text-xl font-bold text-foreground">BeHuman</h1>
              <p className="text-xs text-muted-foreground">Psychological Wellness Advisor</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link href="/register">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="flex justify-center mb-8">
            <BehumanLogo size={120} className="text-primary animate-pulse" />
          </div>
          
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
            AI-Powered Wellness Solutions
          </Badge>
          
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
            Your Employee's{' '}
            <span className="text-primary bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Mental Health
            </span>{' '}
            Companion
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
            BeHuman is an intelligent psychological advisor that helps organizations track employee wellness, 
            provide personalized wellbeing plans, and boost productivity by maintaining optimal mental health 
            while reducing staff turnover.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/register">
              <Button size="lg" className="text-lg px-8 py-4">
                Start Free Trial
              </Button>
            </Link>
            <Link href="/admin/dashboard">
              <Button variant="outline" size="lg" className="text-lg px-8 py-4">
                View Demo Dashboard
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">85%</div>
              <p className="text-muted-foreground">Reduction in Staff Turnover</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">92%</div>
              <p className="text-muted-foreground">Employee Satisfaction Increase</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">40%</div>
              <p className="text-muted-foreground">Productivity Improvement</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-card/50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Complete Employee Wellness Solution
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Our AI-powered system detects emotional situations and provides personalized wellness interventions
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <Card className="border-primary/20 hover:border-primary/40 transition-all duration-300 hover:shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-2xl">🧠</span>
                </div>
                <CardTitle className="text-primary">AI Situation Detection</CardTitle>
                <CardDescription>
                  Automatically detects 4 key psychological situations: breakups, family loss, economic stress, and feeling incapable
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Feature 2 */}
            <Card className="border-primary/20 hover:border-primary/40 transition-all duration-300 hover:shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-2xl">🎯</span>
                </div>
                <CardTitle className="text-primary">Smart Recommendations</CardTitle>
                <CardDescription>
                  8-factor scoring algorithm matches employees with personalized Compensar wellness activities based on age, hobbies, and goals
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Feature 3 */}
            <Card className="border-primary/20 hover:border-primary/40 transition-all duration-300 hover:shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-2xl">🔐</span>
                </div>
                <CardTitle className="text-primary">Privacy-First Design</CardTitle>
                <CardDescription>
                  Anonymous token system ensures complete employee privacy while providing valuable insights to HR teams
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Feature 4 */}
            <Card className="border-primary/20 hover:border-primary/40 transition-all duration-300 hover:shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-2xl">📊</span>
                </div>
                <CardTitle className="text-primary">HR Admin Dashboard</CardTitle>
                <CardDescription>
                  Complete interface for reviewing, approving wellness requests with real-time budget tracking and decision support
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Feature 5 */}
            <Card className="border-primary/20 hover:border-primary/40 transition-all duration-300 hover:shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-2xl">💰</span>
                </div>
                <CardTitle className="text-primary">Budget Management</CardTitle>
                <CardDescription>
                  Automatic budget tracking with period-based allocations, preventing over-spending while maximizing employee benefits
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Feature 6 */}
            <Card className="border-primary/20 hover:border-primary/40 transition-all duration-300 hover:shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-2xl">🌿</span>
                </div>
                <CardTitle className="text-primary">Colombian Context</CardTitle>
                <CardDescription>
                  Culturally aware system with local keywords like "tusa", "Freddy Vega", and holiday-specific stress detection
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">How BeHuman Works</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Simple, effective wellness management in 4 steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-primary font-bold text-xl">1</span>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Employee Chat</h3>
              <p className="text-muted-foreground">AI monitors conversations for emotional distress signals and psychological patterns</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-primary font-bold text-xl">2</span>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Smart Analysis</h3>
              <p className="text-muted-foreground">System classifies situation and generates personalized wellness recommendations</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-primary font-bold text-xl">3</span>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">HR Review</h3>
              <p className="text-muted-foreground">Anonymous requests appear in admin dashboard for approval within budget constraints</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-primary font-bold text-xl">4</span>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Wellness Action</h3>
              <p className="text-muted-foreground">Approved employees receive wellness activities and productivity improvements begin</p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 bg-card/50">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-foreground mb-6">
                Reduce Turnover, Boost Productivity
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                BeHuman's psychological wellness approach directly impacts your bottom line by creating 
                healthier, more engaged employees who stay longer and perform better.
              </p>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-primary text-sm">✓</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Early Intervention</h3>
                    <p className="text-muted-foreground">Detect and address mental health issues before they impact performance or lead to resignation</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-primary text-sm">✓</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Personalized Support</h3>
                    <p className="text-muted-foreground">Tailored wellness recommendations based on individual profiles, situations, and preferences</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-primary text-sm">✓</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Data-Driven Decisions</h3>
                    <p className="text-muted-foreground">Make informed wellness investments with anonymous analytics and budget tracking</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <Card className="border-primary/20 p-8">
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-2xl text-primary">ROI Calculator</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Average Turnover Cost</span>
                      <span className="font-semibold">$15,000</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">BeHuman Annual Cost</span>
                      <span className="font-semibold">$2,400</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Turnover Reduction</span>
                      <span className="font-semibold">85%</span>
                    </div>
                    <hr className="border-primary/20" />
                    <div className="flex justify-between items-center text-lg">
                      <span className="font-semibold text-primary">Annual Savings</span>
                      <span className="font-bold text-primary">$12,750</span>
                    </div>
                    <div className="text-center text-sm text-muted-foreground">
                      *Based on 100-employee organization
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-primary text-primary-foreground">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Transform Your Workplace Wellness?
          </h2>
          <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            Join forward-thinking companies using BeHuman to create healthier, more productive teams 
            while reducing costly employee turnover.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" variant="secondary" className="text-lg px-8 py-4">
                Start 30-Day Free Trial
              </Button>
            </Link>
            <Link href="/admin/dashboard">
              <Button size="lg" variant="outline" className="text-lg px-8 py-4 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
                Schedule a Demo
              </Button>
            </Link>
          </div>

          <div className="mt-8 text-sm opacity-75">
            No credit card required • Full access to all features • Colombian wellness database included
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-card border-t">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <BehumanLogo size={32} className="text-primary" />
              <div>
                <div className="font-bold text-foreground">BeHuman</div>
                <div className="text-sm text-muted-foreground">Psychological Wellness Advisor</div>
              </div>
            </div>
            
            <div className="flex space-x-6 text-sm text-muted-foreground">
              <Link href="/login" className="hover:text-primary">Login</Link>
              <Link href="/admin/dashboard" className="hover:text-primary">Admin Dashboard</Link>
              <Link href="/chat" className="hover:text-primary">Employee Chat</Link>
              <a href="https://github.com/Asperjasp/BeHuman" className="hover:text-primary">GitHub</a>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-border text-center text-sm text-muted-foreground">
            © 2024 BeHuman. Built with Next.js, TypeScript, and Supabase. 
            <br />
            Helping organizations create healthier, more productive workplaces.
          </div>
        </div>
      </footer>
    </div>
  );
}
