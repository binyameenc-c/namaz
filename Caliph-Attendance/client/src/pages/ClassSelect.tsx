import { Link, useRoute } from "wouter";
import { ArrowLeft, Users, ChevronRight } from "lucide-react";
import { CLASSES } from "@/lib/mockData";
import { motion } from "framer-motion";

export default function ClassSelect() {
  const [match, params] = useRoute("/select-class/:type");
  const type = params?.type || "Fajr";

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      <div className="flex items-center space-x-4 pt-4">
        <Link href="/">
          <a className="p-2 bg-secondary rounded-full hover:bg-muted transition-colors">
            <ArrowLeft size={20} />
          </a>
        </Link>
        <div>
          <h1 className="text-2xl font-bold font-heading">{type}</h1>
          <p className="text-sm text-muted-foreground">Select a class to continue</p>
        </div>
      </div>

      <div className="grid gap-3">
        {CLASSES.map((cls, idx) => (
          <motion.div
            key={cls.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            <Link href={`/attendance/${type}/${cls.id}`}>
              <a className="flex items-center justify-between p-5 bg-card border border-border rounded-2xl shadow-sm hover:shadow-md transition-all active:bg-secondary/50 group">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-primary/10 text-primary rounded-xl">
                    <Users size={22} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{cls.name}</h3>
                    <p className="text-sm text-muted-foreground">{cls.students} Students</p>
                  </div>
                </div>
                <ChevronRight className="text-muted-foreground group-hover:text-primary transition-colors" size={20} />
              </a>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
