import React, { useState } from 'react';
import { useCitizenData } from '../../hooks/useCitizenData';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import api from '../../lib/api';
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Calendar as CalendarIcon,
    Clock,
    Plus,
    Building2,
    CalendarCheck
} from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Appointments() {
    const { lang } = useLanguage();
    const { appointments, sectors, loading, refresh } = useCitizenData();
    const { showToast } = useToast();
    const [showBookModal, setShowBookModal] = useState(false);
    const [selectedService, setSelectedService] = useState('');
    const [bookingForm, setBookingForm] = useState({ date: '', timeSlot: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleBook = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await api.post('/appointments/book', {
                serviceId: selectedService,
                ...bookingForm
            });
            showToast('Appointment booked successfully!', 'success');
            setShowBookModal(false);
            refresh();
        } catch (err) {
            showToast(err.response?.data?.message || 'Failed to book appointment', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return <div className="animate-pulse space-y-6"><div className="h-48 bg-muted rounded-3xl" /></div>;

    const appointmentServices = sectors.flatMap(s => s.services.filter(ser => ser.mode === 'APPOINTMENT'));

    return (
        <div className="space-y-10">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-black tracking-tight">{lang === 'en' ? 'My Appointments' : 'ቀጠሮዎቼ'}</h2>
                    <p className="text-muted-foreground font-semibold">Manage your scheduled visits.</p>
                </div>
                <Button
                    onClick={() => setShowBookModal(true)}
                    className="rounded-2xl font-black gap-2 h-12 px-6 shadow-lg shadow-primary/20"
                >
                    <Plus className="w-5 h-5" />
                    Book New
                </Button>
            </div>

            {appointments.length > 0 ? (
                <div className="grid gap-6">
                    {appointments.map((app, i) => (
                        <Card key={i} className="rounded-3xl p-6 border-border bg-card flex flex-col md:flex-row items-center justify-between gap-6 hover:border-primary transition-colors">
                            <div className="flex items-center gap-6 w-full">
                                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                    <CalendarCheck className="w-7 h-7" />
                                </div>
                                <div className="space-y-1 flex-1">
                                    <h4 className="font-black text-xl">{app.service?.name}</h4>
                                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-semibold text-muted-foreground">
                                        <div className="flex items-center gap-2">
                                            <CalendarIcon className="w-4 h-4 text-primary" />
                                            <span>{new Date(app.date).toDateString()}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-4 h-4 text-primary" />
                                            <span>{app.timeSlot}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Building2 className="w-4 h-4 text-primary" />
                                            <span>{app.service?.sector?.name}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center justify-between w-full md:w-auto md:justify-end gap-6">
                                <Badge className={`rounded-xl font-bold px-4 py-1.5 border-none text-sm uppercase italic ${app.status === 'PENDING' ? 'bg-yellow-500/10 text-yellow-500' :
                                        app.status === 'SCHEDULED' ? 'bg-blue-500/10 text-blue-500' :
                                            app.status === 'COMPLETED' ? 'bg-green-500/10 text-green-500' :
                                                app.status === 'CANCELLED' ? 'bg-red-500/10 text-red-500' :
                                                    'bg-primary/10 text-primary'
                                    }`}>
                                    {app.status}
                                </Badge>
                                <Button variant="outline" className="rounded-xl font-bold h-10 border-border md:hidden lg:flex" disabled>
                                    Manage
                                </Button>
                            </div>
                        </Card>
                    ))}
                </div>
            ) : (
                <Card className="rounded-[40px] p-16 border-dashed border-2 bg-muted/5 flex flex-col items-center justify-center text-center space-y-6">
                    <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                        <CalendarIcon className="w-10 h-10" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-black">No Appointments Yet</h3>
                        <p className="text-muted-foreground font-semibold max-w-sm mx-auto">
                            You don't have any upcoming appointments scheduled. Skip the wait by booking your slot in advance.
                        </p>
                    </div>
                    <Button
                        variant="secondary"
                        onClick={() => setShowBookModal(true)}
                        className="rounded-2xl font-black px-10 h-12"
                    >
                        Schedule First Visit
                    </Button>
                </Card>
            )}

            {/* Book Appointment Dialog */}
            <Dialog open={showBookModal} onOpenChange={setShowBookModal}>
                <DialogContent className="sm:max-w-[425px] rounded-[32px] p-8">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black">Book Appointment</DialogTitle>
                        <DialogDescription className="font-semibold text-muted-foreground">
                            Choose a service and pick your preferred time slot.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleBook} className="space-y-6 pt-4">
                        <div className="space-y-2">
                            <Label htmlFor="service" className="font-bold">Service</Label>
                            <select
                                id="service"
                                className="w-full h-12 rounded-xl border border-input bg-background px-3 py-2 font-bold focus:ring-2 focus:ring-primary outline-none"
                                required
                                value={selectedService}
                                onChange={e => setSelectedService(e.target.value)}
                            >
                                <option value="">Select a service</option>
                                {appointmentServices.map(s => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="date" className="font-bold">Preferred Date</Label>
                            <Input
                                id="date"
                                type="date"
                                required
                                className="h-12 rounded-xl"
                                min={new Date().toISOString().split('T')[0]}
                                value={bookingForm.date}
                                onChange={e => setBookingForm({ ...bookingForm, date: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="time" className="font-bold">Time Slot</Label>
                            <select
                                id="time"
                                className="w-full h-12 rounded-xl border border-input bg-background px-3 py-2 font-bold focus:ring-2 focus:ring-primary outline-none"
                                required
                                value={bookingForm.timeSlot}
                                onChange={e => setBookingForm({ ...bookingForm, timeSlot: e.target.value })}
                            >
                                <option value="">Select a slot</option>
                                <option value="08:30 - 09:30">08:30 - 09:30</option>
                                <option value="09:30 - 10:30">09:30 - 10:30</option>
                                <option value="10:30 - 11:30">10:30 - 11:30</option>
                                <option value="14:00 - 15:00">14:00 - 15:00</option>
                                <option value="15:00 - 16:30">15:00 - 16:30</option>
                            </select>
                        </div>

                        <DialogFooter className="pt-4">
                            <Button
                                type="submit"
                                className="w-full h-12 rounded-2xl font-black shadow-lg shadow-primary/20"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Booking...' : 'Confirm Appointment'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
