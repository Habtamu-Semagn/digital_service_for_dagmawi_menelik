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
    const { lang, setLang } = useLanguage();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const t = translations[lang];

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="min-h-screen bg-background text-foreground transition-colors duration-300 selection:bg-primary/20">
            {/* Navigation */}
            <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-background/80 backdrop-blur-lg border-b border-border py-4' : 'bg-transparent py-6'}`}>
                <div className="container mx-auto px-6 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <img src="/logo.png" alt="Logo" className="w-11 h-11 object-contain" />
                        <span className="text-xl font-bold tracking-tight hidden sm:block">
                            {lang === 'en' ? 'Dagmawi Menelik' : 'ዳግማዊ ምኒልክ'}
                        </span>
                    </div>

                    <div className="hidden md:flex items-center gap-8">
                        <div className="flex items-center gap-6">
                            <a href="#services" className="text-sm font-semibold text-muted-foreground hover:text-primary transition-colors tracking-wide">{t.navServices}</a>
                            <a href="#about" className="text-sm font-semibold text-muted-foreground hover:text-primary transition-colors tracking-wide">{t.navAbout}</a>
                            <a href="#contact" className="text-sm font-semibold text-muted-foreground hover:text-primary transition-colors tracking-wide">{t.navContact}</a>
                        </div>

                        <div className="h-6 w-px bg-border mx-2" />

                        <div className="flex items-center gap-3">
                            <ThemeToggle />

                            <Button variant="outline" size="sm" onClick={() => setLang(lang === 'en' ? 'am' : 'en')} className="flex items-center gap-2 rounded-full font-bold border-border">
                                <Globe className="w-4 h-4" />
                                {lang === 'en' ? 'አማርኛ' : 'English'}
                            </Button>

                            <Link to="/login">
                                <Button className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-6 shadow-sm">
                                    {t.navPortal}
                                </Button>
                            </Link>
                        </div>
                    </div>

                    <button className="md:hidden p-2 text-foreground" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                        {isMobileMenuOpen ? <X /> : <Menu />}
                    </button>
                </div>
            </nav>

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
                                    <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-8 h-14 rounded-2xl shadow-xl shadow-primary/20 font-bold group w-full sm:w-auto">
                                        {t.heroCTA}
                                        <ArrowRight className="ml-2 w-6 h-6 group-hover:translate-x-1 transition-transform" />
                                    </Button>
                                </Link>
                                <Button size="lg" variant="outline" className="text-lg px-8 h-14 rounded-2xl border-2 font-bold hover:bg-accent/10">
                                    {t.heroSecondary}
                                </Button>
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

            {/* Footer */}
            <footer className="pt-24 bg-background">
                <div className="w-full bg-[#0f172a] text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[120px]" />
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/10 rounded-full blur-[120px]" />
                    <div className="container mx-auto px-6 p-12 lg:p-20 relative z-10">
                        <div className="grid lg:grid-cols-12 gap-16 lg:gap-24">
                            <div className="lg:col-span-5 space-y-8">
                                <div className="flex items-center gap-3">
                                    <img src="/logo.png" alt="Logo" className="w-12 h-12 object-contain" />
                                    <span className="text-2xl font-black tracking-tight uppercase">Dagmawi Menelik</span>
                                </div>
                                <p className="text-white/60 text-lg leading-relaxed max-w-md italic">{t.footerSlogan}</p>
                                <div className="flex gap-4">
                                    {[Facebook, Twitter, Linkedin].map((Icon, i) => (
                                        <button key={i} className="w-10 h-10 bg-white/5 rounded-2xl flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all duration-300 border border-white/10">
                                            <Icon className="w-5 h-5" />
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-12">
                                <div className="space-y-6">
                                    <h4 className="font-black uppercase text-xs tracking-widest text-primary">{lang === 'en' ? 'Quick Links' : 'አቋራጭ ሊንኮች'}</h4>
                                    <ul className="space-y-4 text-sm font-semibold text-white/60">
                                        <li><a href="#" className="hover:text-primary transition-colors">{t.navServices}</a></li>
                                        <li><a href="#" className="hover:text-primary transition-colors">{t.navAbout}</a></li>
                                        <li><a href="#" className="hover:text-primary transition-colors">{lang === 'en' ? 'Latest News' : 'ወቅታዊ መረጃዎች'}</a></li>
                                        <li><a href="#" className="hover:text-primary transition-colors">{lang === 'en' ? 'Office Map' : 'ቢሮ አድራሻ'}</a></li>
                                    </ul>
                                </div>
                                <div className="space-y-6">
                                    <h4 className="font-black uppercase text-xs tracking-widest text-primary">{lang === 'en' ? 'Support' : 'እገዛ'}</h4>
                                    <ul className="space-y-4 text-sm font-semibold text-white/60">
                                        <li className="flex items-start gap-3"><Phone className="w-4 h-4 text-primary shrink-0" /> +251 58 220 XXXX</li>
                                        <li className="flex items-start gap-3"><Mail className="w-4 h-4 text-primary shrink-0" /> info@dms.gov.et</li>
                                        <li className="flex items-start gap-3"><MapPin className="w-4 h-4 text-primary shrink-0" /> Bahir Dar, Ethiopia</li>
                                    </ul>
                                </div>
                                <div className="space-y-6 col-span-2 sm:col-span-1">
                                    <h4 className="font-black uppercase text-xs tracking-widest text-primary">{lang === 'en' ? 'Office Hours' : 'የስራ ሰዓት'}</h4>
                                    <div className="p-6 bg-white/5 rounded-2xl border border-white/10 space-y-3">
                                        <div>
                                            <div className="text-[10px] font-bold text-white/40 uppercase mb-1">{lang === 'en' ? 'Weekdays' : 'የስራ ቀናት'}</div>
                                            <div className="font-black text-white">8:30 AM - 5:30 PM</div>
                                        </div>
                                        <div className="h-px bg-white/10" />
                                        <div>
                                            <div className="text-[10px] font-bold text-white/40 uppercase mb-1">{lang === 'en' ? 'Saturday' : 'ቅዳሜ'}</div>
                                            <div className="font-black text-white">9:00 AM - 12:00 PM</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
