import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { z } from 'zod';

const loginSchema = z.object({
  username: z.string().min(1, 'Nom d\'utilisateur requis'),
  password: z.string().min(1, 'Mot de passe requis'),
});

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { username, password } = loginSchema.parse(req.body);
      const result = await this.authService.login(
        username,
        password,
        req.ip ?? req.socket?.remoteAddress
      );
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  };

  refresh = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        res.status(400).json({ success: false, error: { message: 'Token de rafraîchissement manquant' } });
        return;
      }
      const result = await this.authService.refreshAccessToken(refreshToken);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  };

  me = async (req: Request, res: Response): Promise<void> => {
    res.json({ success: true, data: req.user });
  };

  logout = async (req: Request, res: Response): Promise<void> => {
    // Côté client : supprimer les tokens. Côté serveur : log uniquement.
    res.json({ success: true, message: 'Déconnexion effectuée' });
  };
}
