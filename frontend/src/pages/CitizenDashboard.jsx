import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import {
    LogOut,
    User,
    LayoutDashboard,
    ClipboardList,
    Calendar,
    Settings,
    Bell,
    Search,
    ChevronRight,
    Clock,
    MapPin,
    Building2,
    Ticket
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import ThemeToggle from '../components/ThemeToggle';

export default function CitizenDashboard() {
    const { user, logout } = useAuth();
    const { lang, setLang } = useLanguage();
    const { showToast } = useToast();
    const navigate = useNavigate();
    const [sectors, setSectors] = useState([]);
    const [selectedSector, setSelectedSector] = useState(null);
    const [activeQueue, setActiveQueue] = useState(null);
    const [appointments, setAppointments] = useState([]);
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('dashboard');
    const [showAppointmentModal, setShowAppointmentModal] = useState(false);
    const [showConfirmCancel, setShowConfirmCancel] = useState(null);
    const [selectedService, setSelectedService] = useState(null);
    const [appointmentForm, setAppointmentForm] = useState({ date: '', timeSlot: '' });

    const fetchData = async () => {
        try {
            const [sectorsRes, queueRes, appointmentsRes, historyRes] = await Promise.all([
                api.get('/services/sectors'),
                api.get('/queues/my-status'),
                api.get('/appointments/my-appointments'),
                api.get('/queues/my-history')
            ]);
            setSectors(sectorsRes.data);
            setActiveQueue(queueRes.data);
            setAppointments(appointmentsRes.data);
            setRequests(historyRes.data);
        } catch (err) {
            console.error('Failed to fetch dashboard data', err);
            showToast('Failed to fetch dashboard data', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(async () => {
            try {
                const { data } = await api.get('/queues/my-status');
                setActiveQueue(data);
            } catch (err) {
                console.error('Status poll failed', err);
            }
        }, 10000); // 10s poll
        return () => clearInterval(interval);
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const handleTakeTicket = async (serviceId) => {
        try {
            const { data } = await api.post('/queues/take', { serviceId });
            setActiveQueue(data);
            setSelectedSector(null);
            showToast('Ticket taken successfully!', 'success');
            fetchData();
        } catch (err) {
            console.error('Failed to take ticket', err);
            showToast(err.response?.data?.message || 'Failed to take ticket', 'error');
        }
    };

    const handleCancelTicket = async (queueId) => {
        try {
            await api.delete(`/queues/${queueId}`);
            setActiveQueue(null);
            setShowConfirmCancel(null);
            showToast('Ticket cancelled', 'info');
            fetchData();
        } catch (err) {
            console.error('Failed to cancel ticket', err);
            showToast('Failed to cancel ticket', 'error');
        }
    };

    const handleBookAppointment = async (e) => {
        e.preventDefault();
        try {
            await api.post('/appointments/book', {
                serviceId: selectedService.id,
                ...appointmentForm
            });
            setShowAppointmentModal(false);
            showToast('Appointment booked successfully!', 'success');
            fetchData();
        } catch (err) {
            console.error('Failed to book appointment', err);
            showToast(err.response?.data?.message || 'Failed to book appointment', 'error');
        }
    };

    return (
        <div className="min-h-screen bg-background flex">
            {/* Sidebar */}
            <aside className="w-72 border-r border-border bg-card hidden lg:flex flex-col p-8 space-y-10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                        <Building2 className="text-primary-foreground w-6 h-6" />
                    </div>
                    <span className="font-black text-lg uppercase tracking-tight">Dagmawi Portal</span>
                </div>

                <nav className="flex-1 space-y-2">
                    {[
                        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
                        { id: 'requests', label: 'My Requests', icon: ClipboardList },
                        { id: 'appointments', label: 'Appointments', icon: Calendar },
                        { id: 'profile', label: 'Profile', icon: User },
                        { id: 'settings', label: 'Settings', icon: Settings },
                    ].map((item, i) => (
                        <Button
                            key={i}
                            variant={activeTab === item.id ? 'secondary' : 'ghost'}
                            className={`w-full justify-start gap-4 h-12 rounded-xl font-bold ${activeTab === item.id ? 'bg-primary/10 text-primary' : 'text-muted-foreground'}`}
                            onClick={() => setActiveTab(item.id)}
                        >
                            <item.icon className="w-5 h-5" />
                            {item.label}
                        </Button>
                    ))}
                </nav>

                <Button variant="ghost" className="justify-start gap-4 text-destructive font-bold h-12 rounded-xl" onClick={handleLogout}>
                    <LogOut className="w-5 h-5" />
                    Log Out
                </Button>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col h-screen overflow-hidden">
                {/* Header */}
                <header className="h-20 border-b border-border bg-background/50 backdrop-blur-md px-8 flex items-center justify-between shrink-0">
                    <div className="relative w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input placeholder="Search services..." className="pl-10 h-11 rounded-xl border-border bg-muted/20" />
                    </div>

                    <div className="flex items-center gap-4">
                        <ThemeToggle />
                        <Button variant="outline" size="sm" onClick={() => setLang(lang === 'en' ? 'am' : 'en')} className="rounded-full font-bold border-border">
                            {lang === 'en' ? 'አማርኛ' : 'English'}
                        </Button>
                        <Button variant="outline" size="icon" className="rounded-full w-11 h-11 border-border relative">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-primary rounded-full border-2 border-background" />
                        </Button>
                        <div className="h-10 w-px bg-border mx-2" />
                        <div className="flex items-center gap-3 bg-muted/30 px-4 py-2 rounded-2xl border border-border">
                            <div className="text-right">
                                <div className="text-sm font-black text-foreground">{user?.name}</div>
                                <div className="text-[10px] font-bold text-primary uppercase">Citizen</div>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary font-black">
                                {user?.name?.[0]}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Scrollable Area */}
                <div className="flex-1 overflow-y-auto p-8 bg-muted/5">
                    <div className="max-w-6xl mx-auto space-y-10">
                        {activeTab === 'dashboard' && (
                            <>
                                {/* Welcome Section */}
                                <div className="flex justify-between items-end">
                                    <div>
                                        <h2 className="text-4xl font-black tracking-tight mb-2">Welcome back!</h2>
                                        <p className="text-muted-foreground font-semibold flex items-center gap-2">
                                            <MapPin className="w-4 h-4 text-primary" /> Bahir Dar City Portal
                                        </p>
                                    </div>
                                    <div className="bg-primary/5 px-6 py-4 rounded-3xl border border-primary/10 text-right">
                                        <div className="text-xs font-black text-primary uppercase mb-1">Queue Status</div>
                                        <div className="text-2xl font-black">Live Tracking</div>
                                    </div>
                                </div>

                                {/* Active Queue Card */}
                                {activeQueue && (
                                    <Card className="bg-primary text-primary-foreground border-none rounded-[40px] shadow-2xl shadow-primary/20 p-8 flex flex-col md:flex-row items-center justify-between gap-8">
                                        <div className="space-y-4">
                                            <Badge className={`${activeQueue.status === 'CALLING' || activeQueue.status === 'PROCESSING' ? 'bg-orange-500 animate-pulse' : 'bg-white/20'} text-white font-bold px-4 py-1.5 border-none`}>
                                                {activeQueue.status === 'CALLING' ? 'YOUR TURN! GO TO COUNTER' :
                                                    activeQueue.status === 'PROCESSING' ? 'CURRENTLY SERVING' : 'Active Ticket'}
                                            </Badge>
                                            <h3 className="text-3xl font-black">{activeQueue.service?.name}</h3>
                                            <div className="flex items-center gap-6">
                                                <div className="flex items-center gap-2">
                                                    <Clock className="w-5 h-5 opacity-70" />
                                                    <span className="font-bold">Est. Wait: {(activeQueue.peopleAhead || 0) * 5} mins</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Ticket className="w-5 h-5 opacity-70" />
                                                    <span className="font-bold">Sector: {activeQueue.service?.sector?.name}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-8">
                                            <div className="text-center">
                                                <div className="text-[10px] font-black uppercase opacity-70 mb-2">Your Number</div>
                                                <div className="text-7xl font-black leading-none">{activeQueue.ticketNumber}</div>
                                            </div>
                                            <div className="w-px h-16 bg-white/20 hidden md:block" />
                                            <div className="text-center">
                                                <div className="text-[10px] font-black uppercase opacity-70 mb-2">People Ahead</div>
                                                <div className="text-7xl font-black leading-none">{activeQueue.peopleAhead || 0}</div>
                                            </div>
                                        </div>
                                    </Card>
                                )}

                                {/* Service Sectors */}
                                <section className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-2xl font-black">
                                            {selectedSector ? (
                                                <div className="flex items-center gap-2">
                                                    <Button variant="ghost" size="sm" onClick={() => setSelectedSector(null)} className="p-0 h-auto font-black text-muted-foreground hover:text-primary">Sectors</Button>
                                                    <ChevronRight className="w-5 h-5" />
                                                    <span>{selectedSector.name}</span>
                                                </div>
                                            ) : 'Available Sectors'}
                                        </h3>
                                        {!selectedSector && <Button variant="link" className="text-primary font-bold">View All Services</Button>}
                                    </div>

                                    {!selectedSector ? (
                                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {sectors.map((sector, i) => (
                                                <Card key={i} className="group hover:border-primary transition-all duration-300 rounded-[32px] p-6 cursor-pointer bg-card hover:translate-y-[-4px]" onClick={() => setSelectedSector(sector)}>
                                                    <CardHeader className="p-0 space-y-4">
                                                        <div className="w-14 h-14 rounded-2xl bg-muted/50 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300 shadow-sm">
                                                            <Building2 className="w-7 h-7" />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <CardTitle className="text-xl font-bold">{sector.name}</CardTitle>
                                                            <CardDescription className="text-muted-foreground font-semibold leading-relaxed">
                                                                {sector.description}
                                                            </CardDescription>
                                                        </div>
                                                    </CardHeader>
                                                    <div className="mt-8 flex justify-end">
                                                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                                                            <ChevronRight className="w-6 h-6" />
                                                        </div>
                                                    </div>
                                                </Card>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {selectedSector.services?.map((service, i) => (
                                                <Card key={i} className="rounded-[32px] p-6 bg-card border-border hover:border-primary transition-colors">
                                                    <div className="space-y-4">
                                                        <Badge variant="secondary" className="rounded-lg">{service.mode}</Badge>
                                                        <h4 className="text-xl font-black">{service.name}</h4>
                                                        <p className="text-sm text-muted-foreground font-semibold">Available: {service.availability}</p>
                                                        <Button
                                                            className="w-full rounded-2xl h-12 font-black mt-4"
                                                            onClick={() => {
                                                                if (service.mode === 'QUEUE') {
                                                                    handleTakeTicket(service.id);
                                                                } else {
                                                                    setSelectedService(service);
                                                                    setShowAppointmentModal(true);
                                                                }
                                                            }}
                                                            disabled={service.mode === 'QUEUE' && activeQueue !== null}
                                                        >
                                                            {service.mode === 'QUEUE' ? 'Take Queue Ticket' : 'Book Appointment'}
                                                        </Button>
                                                    </div>
                                                </Card>
                                            ))}
                                        </div>
                                    )}
                                </section>
                            </>
                        )}

                        {showAppointmentModal && (
                            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
                                <Card className="w-full max-w-md rounded-[40px] p-8 border-none shadow-2xl relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-full h-2 bg-primary" />
                                    <div className="space-y-6">
                                        <div>
                                            <h3 className="text-3xl font-black mb-2">Book Appointment</h3>
                                            <p className="text-muted-foreground font-semibold">For {selectedService?.name}</p>
                                        </div>

                                        <form onSubmit={handleBookAppointment} className="space-y-4">
                                            <div className="space-y-2">
                                                <label className="text-sm font-black uppercase text-muted-foreground ml-1">Preferred Date</label>
                                                <Input
                                                    type="date"
                                                    required
                                                    className="h-12 rounded-2xl border-border"
                                                    min={new Date().toISOString().split('T')[0]}
                                                    value={appointmentForm.date}
                                                    onChange={e => setAppointmentForm({ ...appointmentForm, date: e.target.value })}
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-sm font-black uppercase text-muted-foreground ml-1">Time Slot</label>
                                                <select
                                                    className="w-full h-12 rounded-2xl border-border bg-background px-4 font-bold border"
                                                    required
                                                    value={appointmentForm.timeSlot}
                                                    onChange={e => setAppointmentForm({ ...appointmentForm, timeSlot: e.target.value })}
                                                >
                                                    <option value="">Select a slot</option>
                                                    <option value="08:30 - 09:30">08:30 - 09:30</option>
                                                    <option value="09:30 - 10:30">09:30 - 10:30</option>
                                                    <option value="10:30 - 11:30">10:30 - 11:30</option>
                                                    <option value="14:00 - 15:00">14:00 - 15:00</option>
                                                    <option value="15:00 - 16:30">15:00 - 16:30</option>
                                                </select>
                                            </div>

                                            <div className="flex gap-4 pt-4">
                                                <Button type="button" variant="ghost" className="flex-1 rounded-2xl font-bold h-12" onClick={() => setShowAppointmentModal(false)}>Cancel</Button>
                                                <Button type="submit" className="flex-1 rounded-2xl font-black h-12 shadow-lg shadow-primary/20">Confirm Booking</Button>
                                            </div>
                                        </form>
                                    </div>
                                </Card>
                            </div>
                        )}

                        {activeTab === 'requests' && (
                            <section className="space-y-6 animate-in fade-in duration-500">
                                <h3 className="text-3xl font-black">My Requests</h3>
                                {requests.length > 0 ? (
                                    <div className="grid gap-4">
                                        {requests.map((req, i) => (
                                            <Card key={i} className="rounded-3xl p-6 border-border bg-card flex items-center justify-between">
                                                <div className="flex items-center gap-6">
                                                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-black">
                                                        #{req.ticketNumber}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-black text-lg">{req.service?.name}</h4>
                                                        <p className="text-sm text-muted-foreground font-semibold">{new Date(req.createdAt).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                                <Badge variant={req.status === 'COMPLETED' ? 'success' : req.status === 'REJECTED' ? 'destructive' : 'secondary'} className="rounded-lg font-bold">
                                                    {req.status}
                                                </Badge>
                                            </Card>
                                        ))}
                                    </div>
                                ) : (
                                    <Card className="rounded-[32px] p-8 border-border bg-card">
                                        <p className="text-muted-foreground font-bold italic">You have no active or historical requests yet.</p>
                                    </Card>
                                )}
                            </section>
                        )}

                        {activeTab === 'appointments' && (
                            <section className="space-y-6 animate-in fade-in duration-500">
                                <h3 className="text-3xl font-black">My Appointments</h3>
                                {appointments.length > 0 ? (
                                    <div className="grid gap-4">
                                        {appointments.map((app, i) => (
                                            <Card key={i} className="rounded-3xl p-6 border-border bg-card flex items-center justify-between">
                                                <div className="flex items-center gap-6">
                                                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                                                        <Calendar className="w-6 h-6" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-black text-lg">{app.service?.name}</h4>
                                                        <div className="flex items-center gap-4 text-sm font-semibold text-muted-foreground">
                                                            <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {new Date(app.date).toDateString()}</span>
                                                            <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {app.timeSlot}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <Badge className="rounded-lg font-bold bg-primary/10 text-primary border-none">
                                                    {app.status}
                                                </Badge>
                                            </Card>
                                        ))}
                                    </div>
                                ) : (
                                    <Card className="rounded-[32px] p-8 border-border bg-card">
                                        <p className="text-muted-foreground font-bold italic">No upcoming appointments scheduled.</p>
                                    </Card>
                                )}
                            </section>
                        )}

                        {activeTab === 'profile' && (
                            <section className="space-y-6 animate-in fade-in duration-500">
                                <div className="flex items-center gap-6 mb-10">
                                    <div className="w-24 h-24 rounded-3xl bg-primary/10 flex items-center justify-center text-primary text-4xl font-black">
                                        {user?.name?.[0]}
                                    </div>
                                    <div>
                                        <h3 className="text-3xl font-black">{user?.name}</h3>
                                        <p className="text-muted-foreground font-bold uppercase tracking-widest">{user?.role}</p>
                                    </div>
                                </div>
                                <div className="grid md:grid-cols-2 gap-6">
                                    <Card className="rounded-[32px] p-8 border-border bg-card space-y-4">
                                        <h4 className="font-black text-xl">Account Details</h4>
                                        <div className="space-y-2">
                                            <div className="flex justify-between font-bold">
                                                <span className="text-muted-foreground">Phone Number</span>
                                                <span>{user?.phoneNumber}</span>
                                            </div>
                                            <div className="flex justify-between font-bold">
                                                <span className="text-muted-foreground">User ID</span>
                                                <span>{user?.id?.slice(0, 8)}...</span>
                                            </div>
                                        </div>
                                    </Card>
                                </div>
                            </section>
                        )}

                        {activeTab === 'settings' && (
                            <section className="space-y-6 animate-in fade-in duration-500">
                                <h3 className="text-3xl font-black">Settings</h3>
                                <Card className="rounded-[32px] p-8 border-border bg-card space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-black text-lg">System Appearance</p>
                                            <p className="text-sm text-muted-foreground font-semibold">Toggle between light and dark themes</p>
                                        </div>
                                        <ThemeToggle />
                                    </div>
                                </Card>
                            </section>
                        )}
                        {showConfirmCancel && (
                            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] flex items-center justify-center p-6">
                                <Card className="w-full max-w-sm rounded-[40px] p-8 border-none shadow-2xl space-y-6">
                                    <div className="text-center">
                                        <div className="w-16 h-16 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mx-auto mb-4">
                                            <AlertCircle className="w-8 h-8" />
                                        </div>
                                        <h3 className="text-2xl font-black">Cancel Ticket?</h3>
                                        <p className="text-muted-foreground font-semibold mt-2">Are you sure you want to release your spot in the queue?</p>
                                    </div>
                                    <div className="flex gap-4">
                                        <Button variant="ghost" className="flex-1 rounded-2xl font-bold h-12" onClick={() => setShowConfirmCancel(null)}>Keep Ticket</Button>
                                        <Button variant="destructive" className="flex-1 rounded-2xl font-black h-12 shadow-lg shadow-destructive/20" onClick={() => handleCancelTicket(showConfirmCancel)}>Yes, Cancel</Button>
                                    </div>
                                </Card>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
