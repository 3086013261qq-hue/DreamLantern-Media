import { registerMvuSchema } from 'https://testingcf.jsdelivr.net/gh/StageDog/tavern_resource/dist/util/mvu_zod.js';
export const Schema = z.object({
 _时代: z.enum(['未选择','古代','现代']).catch('未选择').prefault('未选择'),
 _当前篇章: z.string().prefault(''),
 _现代锁定: z.boolean().prefault(false),
}).prefault({_时代:'未选择',_当前篇章:'',_现代锁定:false});
$(() => { registerMvuSchema(Schema); });
