import { Body, Controller, Get, Headers, Ip, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { CurrentUser } from './decorators/current-user.decorator';
import { Public } from './decorators/public.decorator';
import { RequirePermissions } from './decorators/permissions.decorator';
import { AcceptInvitationDto } from './dto/accept-invitation.dto';
import { InviteUserDto } from './dto/invite.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RefreshDto } from './dto/refresh.dto';
import { RequestPasswordResetDto, ResetPasswordDto } from './dto/password-reset.dto';
import { AuthenticatedUser } from './auth.types';
@ApiTags('auth') @Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}
  @Public() @Post('register') @ApiOperation({ summary: 'Create an organization and its first administrator' }) register(@Body() dto: RegisterDto) { return this.auth.register(dto); }
  @Public() @Post('login') login(@Body() dto: LoginDto, @Ip() ipAddress: string, @Headers('user-agent') userAgent?: string) { return this.auth.login(dto, { ipAddress, userAgent }); }
  @Public() @Post('refresh') refresh(@Body() dto: RefreshDto) { return this.auth.refresh(dto.refreshToken); }
  @Post('logout') @ApiBearerAuth() logout(@CurrentUser() user: AuthenticatedUser, @Body() dto: Partial<RefreshDto>) { return this.auth.logout(user.sub, dto.refreshToken); }
  @Get('me') @ApiBearerAuth() me(@CurrentUser() user: AuthenticatedUser) { return this.auth.profile(user.sub); }
  @Post('invitations') @ApiBearerAuth() @RequirePermissions('users.invite') invite(@CurrentUser() user: AuthenticatedUser, @Body() dto: InviteUserDto) { return this.auth.invite(user.sub, user.organizationId, dto); }
  @Public() @Post('invitations/accept') accept(@Body() dto: AcceptInvitationDto) { return this.auth.acceptInvitation(dto); }
  @Public() @Post('password-reset/request') requestReset(@Body() dto: RequestPasswordResetDto) { return this.auth.requestPasswordReset(dto); }
  @Public() @Post('password-reset/confirm') reset(@Body() dto: ResetPasswordDto) { return this.auth.resetPassword(dto); }
}
