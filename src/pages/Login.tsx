import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import logoHelen from "@/assets/logo-helen-assad.png";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Login realizado com sucesso!");
    navigate("/");
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
          <p className="text-gray-300 text-lg leading-relaxed max-w-md">Controle de Prazos - Advocacia Previdenciária</p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <div className="lg:hidden text-center mb-8">
            <img src={logoHelen} alt="Dra. Helen Assad" className="w-24 h-24 object-contain mx-auto mb-2" />
            <h1 className="font-serif text-2xl font-bold gold-text">Dra. Helen Assad</h1>
          </div>

          <h2 className="font-serif text-2xl font-bold mb-1 text-foreground">Entrar</h2>
          <p className="text-muted-foreground text-sm mb-8 opacity-80">Acesse sua conta para continuar</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" type="email" placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} className="bg-secondary border-border" required />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Senha</Label>
                <Link to="/forgot-password" className="text-xs text-primary hover:underline">Esqueceu a senha?</Link>
              </div>
              <div className="relative">
                <Input id="password" type={showPassword ? "text" : "password"} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="bg-secondary border-border text-foreground pr-10" required />
                <Button type="button" variant="ghost" size="icon" className="absolute right-0 top-0 h-10 w-10 text-muted-foreground hover:text-foreground" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
            </div>
            <Button type="submit" disabled={loading} className="w-full gold-gradient text-primary-foreground font-semibold hover:opacity-90 transition-opacity">
              {loading ? "Entrando..." : "Entrar"}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Não tem conta?{" "}
            <Link to="/register" className="text-primary hover:underline">Criar conta</Link>
          </p>
          <p className="text-center text-xs text-muted-foreground mt-8">© 2026 Dra. Helen Assad Advogados & Associados</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
