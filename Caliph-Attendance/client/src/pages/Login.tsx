import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import logo from '@assets/logo-social_1765305531532.png';

interface Teacher {
  id: string;
  name: string;
  email: string;
}

interface LoginProps {
  onLogin: (teacher: Teacher) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [slotsAvailable, setSlotsAvailable] = useState<number | null>(null);
  const { toast } = useToast();

  useState(() => {
    fetch("/api/teachers/count")
      .then((res) => res.json())
      .then((data) => setSlotsAvailable(data.available))
      .catch(() => {});
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const endpoint = isRegister ? "/api/teachers/register" : "/api/teachers/login";
      const body = isRegister ? { name, email, password } : { email, password };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      toast({
        title: isRegister ? "Registration successful!" : "Welcome back!",
        description: `Hello, ${data.name}`,
        className: "bg-emerald-50 border-emerald-200 text-emerald-900",
      });

      onLogin(data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-400 to-emerald-600 flex items-center justify-center p-4">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="w-[350px] shadow-2xl">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto mb-4 bg-emerald-50 p-4 rounded-2xl">
              <img src={logo} alt="Caliph Logo" className="w-20 h-20 object-contain" />
            </div>
            <CardTitle className="text-2xl font-bold text-emerald-800">
              {isRegister ? "Create Account" : "Teacher Login"}
            </CardTitle>
            {slotsAvailable !== null && isRegister && (
              <p className="text-sm text-gray-500 mt-2">
                {slotsAvailable} teacher slot{slotsAvailable !== 1 ? "s" : ""} available
              </p>
            )}
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {isRegister && (
                <Input
                  type="text"
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              )}
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={4}
              />
              <Button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700"
                disabled={loading}
              >
                {loading ? "Please wait..." : isRegister ? "Register" : "Login"}
              </Button>
            </form>
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => setIsRegister(!isRegister)}
                className="text-sm text-emerald-600 hover:underline"
              >
                {isRegister ? "Already have an account? Login" : "New teacher? Register"}
              </button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
