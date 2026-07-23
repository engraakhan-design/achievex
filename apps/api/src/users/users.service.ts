import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { AuditService } from '../audit/audit.service'; import { PrismaService } from '../prisma/prisma.service'; import { ListUsersQuery, UpdateUserDto } from './dto/users.dto';
@Injectable() export class UsersService{
 constructor(private prisma:PrismaService,private audit:AuditService){}
 list(org:string,q:ListUsersQuery){return this.prisma.user.findMany({where:{organizationId:org,status:q.status,departmentId:q.departmentId,OR:q.search?[{email:{contains:q.search,mode:'insensitive'}},{firstName:{contains:q.search,mode:'insensitive'}},{lastName:{contains:q.search,mode:'insensitive'}}]:undefined},orderBy:[{firstName:'asc'},{lastName:'asc'}],select:{id:true,email:true,firstName:true,lastName:true,jobTitle:true,phone:true,status:true,lastLoginAt:true,department:{select:{id:true,name:true}},manager:{select:{id:true,firstName:true,lastName:true}},roles:{select:{role:{select:{id:true,name:true}}}},teamMemberships:{select:{role:true,team:{select:{id:true,name:true}}}}}})}
 get(org:string,id:string){return this.prisma.user.findFirstOrThrow({where:{id,organizationId:org},include:{department:true,manager:{select:{id:true,firstName:true,lastName:true,email:true}},reports:{select:{id:true,firstName:true,lastName:true,email:true}},roles:{include:{role:true}},teamMemberships:{include:{team:true}}}})}
 async update(org:string,id:string,actor:string,dto:UpdateUserDto){
  const current=await this.prisma.user.findFirstOrThrow({where:{id,organizationId:org}}); if(dto.managerId===id) throw new BadRequestException('A user cannot manage themselves');
  if(dto.email && dto.email.toLowerCase()!==current.email && await this.prisma.user.findFirst({where:{organizationId:org,email:dto.email.toLowerCase()}})) throw new ConflictException('Email already exists');
  if(dto.departmentId && !(await this.prisma.department.findFirst({where:{id:dto.departmentId,organizationId:org}}))) throw new BadRequestException('Invalid department');
  if(dto.managerId && !(await this.prisma.user.findFirst({where:{id:dto.managerId,organizationId:org}}))) throw new BadRequestException('Invalid manager');
  const {roleNames,...data}=dto;
  if(roleNames){const roles=await this.prisma.role.findMany({where:{organizationId:org,name:{in:roleNames}}}); if(roles.length!==roleNames.length) throw new BadRequestException('One or more roles are invalid'); await this.prisma.$transaction([this.prisma.userRole.deleteMany({where:{userId:id}}),this.prisma.userRole.createMany({data:roles.map(r=>({userId:id,roleId:r.id}))})]);}
  const user=await this.prisma.user.update({where:{id},data:{...data,email:data.email?.toLowerCase(),tokenVersion:dto.status&&dto.status!=='ACTIVE'?{increment:1}:undefined}});
  if(dto.status&&dto.status!=='ACTIVE') await this.prisma.authToken.updateMany({where:{userId:id,revokedAt:null},data:{revokedAt:new Date()}});
  await this.audit.record({organizationId:org,actorUserId:actor,action:'user.updated',entityType:'User',entityId:id,metadata:{fields:Object.keys(dto)}}); return this.get(org,user.id);
 }
 async remove(org:string,id:string,actor:string){ if(id===actor) throw new BadRequestException('You cannot deactivate your own account'); const user=await this.prisma.user.findFirstOrThrow({where:{id,organizationId:org}}); await this.prisma.user.update({where:{id},data:{status:'DEACTIVATED',tokenVersion:{increment:1}}}); await this.prisma.authToken.updateMany({where:{userId:id,revokedAt:null},data:{revokedAt:new Date()}}); await this.audit.record({organizationId:org,actorUserId:actor,action:'user.deactivated',entityType:'User',entityId:id}); return {id:user.id,status:'DEACTIVATED'}; }
}
