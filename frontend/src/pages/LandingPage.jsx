import React, { useState, useEffect } from 'react';
import {
    Building2,
    Users,
    Calendar,
    Clock,
    CheckCircle2,
    ChevronRight,
    Globe,
    ArrowRight,
    Menu,
    X,
    Phone,
    Mail,
    MapPin,
    Facebook,
    Twitter,
    Linkedin,
    Monitor,
    CalendarCheck,
    LayoutList,
    Sun,
    Moon
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { translations } from '../lib/translations';
import { Link } from 'react-router-dom';

import { useLanguage } from '../context/LanguageContext';
import ThemeToggle from '../components/ThemeToggle';

export default function LandingPage() {
    const { lang } = useLanguage();
    const t = translations[lang];

    return (
        <div className="min-h-screen bg-background text-foreground transition-colors duration-300 selection:bg-primary/20">
            {/* Hero Section */}
            <section className="relative pt-24 pb-12 overflow-hidden lg:pt-32 min-h-[85vh] flex items-center">
                <div className="absolute top-0 right-0 -z-10 w-[60%] h-[120%] bg-primary/5 rounded-bl-[160px] opacity-70" />
                <div className="container mx-auto px-6">
                    <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
                        <div className="lg:w-1/2 space-y-8 text-center lg:text-left">
                            <Badge variant="secondary" className="bg-primary/10 text-primary border-none text-sm font-bold px-5 py-2 mx-auto lg:mx-0">
                                {t.heroBadge}
                            </Badge>
                            <div className="space-y-4">
                                <h1 className="text-4xl lg:text-6xl font-black leading-[1.1] tracking-tight">{t.heroTitle}</h1>
                                <p className="text-lg lg:text-xl text-muted-foreground leading-relaxed max-w-xl mx-auto lg:mx-0">{t.heroSubtitle}</p>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                                <Link to="/login">
                                    <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-8 h-14 rounded-none shadow-xl shadow-primary/20 font-bold group w-full sm:w-auto">
                                        {t.heroCTA}
                                        <ArrowRight className="ml-2 w-6 h-6 group-hover:translate-x-1 transition-transform" />
                                    </Button>
                                </Link>
                            </div>
                        </div>

                        <div className="lg:w-1/2 relative group">
                            <div className="relative z-10 bg-card/50 backdrop-blur-sm rounded-[40px] shadow-2xl p-4 border border-border group-hover:scale-[1.02] transition-transform duration-500 overflow-hidden">
                                <img
                                    src="/hero_image.png"
                                    alt="Dagmawi Menelik Digital Service"
                                    className="w-full h-auto rounded-[32px] object-cover"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats */}
            <section className="py-16 bg-muted/20 border-y border-border">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-12">
                        {[
                            { label: t.statsUsers, value: "15,000+", icon: Users },
                            { label: t.statsTime, value: "45 Min", icon: Clock },
                            { label: t.statsServices, value: "24/7", icon: Monitor },
                            { label: "Uptime", value: "99.9%", icon: CheckCircle2 },
                        ].map((stat, i) => (
                            <div key={i} className="flex flex-col gap-3 text-center lg:text-left">
                                <div className="text-3xl lg:text-4xl font-black text-foreground">{stat.value}</div>
                                <div className="flex items-center justify-center lg:justify-start gap-2">
                                    <stat.icon className="w-3.5 h-3.5 text-primary" />
                                    <span className="text-[10px] font-bold text-muted-foreground tracking-widest uppercase">{stat.label}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features */}
            <section id="services" className="py-24">
                <div className="container mx-auto px-6">
                    <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
                        <Badge className="bg-primary/5 text-primary tracking-widest uppercase font-black px-6 py-2 border-none">{t.featuresTitle}</Badge>
                        <h3 className="text-4xl lg:text-5xl font-black">{t.featuresSubtitle}</h3>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { title: t.feat1Title, desc: t.feat1Desc, icon: Globe },
                            { title: t.feat2Title, desc: t.feat2Desc, icon: Users },
                            { title: t.feat3Title, desc: t.feat3Desc, icon: Calendar },
                        ].map((feat, i) => (
                            <Card key={i} className="group border-border hover:border-primary/50 transition-all duration-500 rounded-[32px] bg-card hover:translate-y-[-6px]">
                                <CardHeader className="p-8 space-y-4">
                                    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500">
                                        <feat.icon className="w-7 h-7" />
                                    </div>
                                    <div className="space-y-3">
                                        <CardTitle className="text-xl font-black">{feat.title}</CardTitle>
                                        <CardDescription className="text-muted-foreground leading-relaxed text-base">{feat.desc}</CardDescription>
                                    </div>
                                </CardHeader>
                                <CardContent className="px-8 pb-8">
                                    <Link to="/login">
                                        <Button variant="ghost" className="p-0 text-primary font-bold hover:bg-transparent flex items-center group/btn gap-2">
                                            {lang === 'en' ? 'Get Started' : 'አሁን ይጀምሩ'}
                                            <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                                        </Button>
                                    </Link>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Process Section */}
            <section className="py-24 px-6 bg-muted/10 border-t border-border">
                <div className="container mx-auto">
                    <div className="text-center max-w-2xl mx-auto mb-20 space-y-4">
                        <h2 className="text-primary font-black uppercase tracking-[0.25em] text-sm">{t.processTitle}</h2>
                        <h3 className="text-4xl lg:text-5xl font-bold tracking-tight">{t.processSubtitle}</h3>
                    </div>
                    <div className="grid md:grid-cols-3 gap-16 relative">
                        <div className="hidden lg:block absolute top-[2.5rem] left-[10%] right-[10%] h-px bg-border z-0" />
                        {[
                            { step: "01", title: t.processStep1, desc: t.processStep1Desc, icon: LayoutList },
                            { step: "02", title: t.processStep2, desc: t.processStep2Desc, icon: ArrowRight },
                            { step: "03", title: t.processStep3, desc: t.processStep3Desc, icon: CheckCircle2 },
                        ].map((item, i) => (
                            <div key={i} className="relative space-y-6 group z-10 text-center lg:text-left">
                                <div className="w-20 h-20 bg-background rounded-3xl flex items-center justify-center border border-border group-hover:border-primary transition-all duration-300 mx-auto lg:mx-0 shadow-sm">
                                    <item.icon className="w-10 h-10 text-primary" />
                                </div>
                                <div className="space-y-2">
                                    <div className="text-sm font-black text-primary mb-1 uppercase tracking-wider">{t.processStepLabel} {item.step}</div>
                                    <h4 className="text-2xl font-bold tracking-tight">{item.title}</h4>
                                    <p className="text-muted-foreground leading-relaxed text-base">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

        </div>
    );
}
