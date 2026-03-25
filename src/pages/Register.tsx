import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import logoHelen from "@/assets/logo-helen-assad.png";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Register = () => {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: window.location.origin,
      },
    });

    setLoading(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Verifique seu e-mail para confirmar o cadastro.");
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex bg-background">
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, hsl(0,0%,8%) 0%, hsl(0,0%,14%) 100%)" }}
      >
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "radial-gradient(circle at 30% 50%, hsl(45,70%,47%) 0%, transparent 50%)" }}
        />
        <div className="relative text-center px-12">
          <img src={logoHelen} alt="Dra. Helen Assad" className="w-48 h-48 object-contain mx-auto mb-6" />
          <h1 className="font-serif text-3xl font-bold gold-text mb-3">Dra. Helen Assad</h1>
          <p className="text-gray-300 text-lg leading-relaxed max-w-md">Advogados & Associados</p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <div className="lg:hidden text-center mb-8">
            <img src={logoHelen} alt="Dra. Helen Assad" className="w-24 h-24 object-contain mx-auto mb-2" />
            <h1 className="font-serif text-2xl font-bold gold-text">Dra. Helen Assad</h1>
          </div>

          <h2 className="font-serif text-2xl font-bold mb-1">Criar Conta</h2>
          <p className="text-muted-foreground text-sm mb-8">Registre-se para acessar o sistema</p>

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Nome Completo</Label>
              <Input id="fullName" placeholder="Seu nome" value={fullName} onChange={(e) => setFullName(e.target.value)} className="bg-secondary border-border" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" type="email" placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} className="bg-secondary border-border" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="bg-secondary border-border" required minLength={6} />
            </div>
            <Button type="submit" disabled={loading} className="w-full gold-gradient text-primary-foreground font-semibold hover:opacity-90 transition-opacity">
              {loading ? "Registrando..." : "Criar Conta"}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Já tem uma conta?{" "}
            <Link to="/login" className="text-primary hover:underline">Entrar</Link>
          </p>
          <p className="text-center text-xs text-muted-foreground mt-8">© 2026 Dra. Helen Assad Advogados & Associados</p>
        </div>
      </div>
    </div>
  );
};

export default Register;
