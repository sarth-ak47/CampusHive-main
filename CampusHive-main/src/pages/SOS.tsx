import { motion } from "framer-motion";
import { ShieldAlert, Phone, Hospital, Flame, Siren } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const contacts = [
  { label: "Campus Security", number: "1800-XXX-0001", icon: ShieldAlert, color: "bg-destructive/10 text-destructive", desc: "24/7 campus patrol & emergency" },
  { label: "Police (100)", number: "100", icon: Siren, color: "bg-warning/10 text-warning", desc: "Local law enforcement" },
  { label: "Fire (101)", number: "101", icon: Flame, color: "bg-accent/10 text-accent", desc: "Fire brigade" },
  { label: "Ambulance / Hospital", number: "102", icon: Hospital, color: "bg-info/10 text-info", desc: "Medical emergency & campus clinic" },
];

const hospitalInfo = {
  name: "Campus Health Center",
  hours: "8:00 AM – 10:00 PM (OPD) · Emergency 24/7",
  location: "Near Academic Block B, Ground Floor",
  phone: "1800-XXX-0005",
};

export default function SOS() {
  return (
    <>
      <PageHeader
        title="SOS & Emergency"
        description="Immediate help when you need it"
        icon={<ShieldAlert className="w-5 h-5 text-primary-foreground" />}
      />

      <div className="grid sm:grid-cols-2 gap-4 mb-8">
        {contacts.map((c, i) => (
          <motion.div key={c.label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <Card className="shadow-card hover:shadow-card-hover transition-all">
              <CardContent className="p-5 flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${c.color}`}>
                  <c.icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground text-sm">{c.label}</h3>
                  <p className="text-xs text-muted-foreground">{c.desc}</p>
                </div>
                <a href={`tel:${c.number}`}>
                  <Button size="sm" variant="outline">
                    <Phone className="w-4 h-4 mr-1" /> Call
                  </Button>
                </a>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Card className="shadow-card">
        <CardContent className="p-5">
          <div className="flex items-center gap-3 mb-3">
            <Hospital className="w-5 h-5 text-info" />
            <h3 className="font-semibold text-foreground">{hospitalInfo.name}</h3>
          </div>
          <div className="space-y-1 text-sm text-muted-foreground">
            <p>🕐 {hospitalInfo.hours}</p>
            <p>📍 {hospitalInfo.location}</p>
            <p>📞 {hospitalInfo.phone}</p>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
