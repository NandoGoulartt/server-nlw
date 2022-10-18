import express, { request, response } from "express";
import cors from 'cors';
import {PrismaClient} from '@prisma/client'
import { convertHourStringToMinute } from "./utils/convert-hour-string-to-minutes";
import { convertMinuteToHourString } from "./utils/conver-minutes-to-hours-string";

const app = express();
const prisma = new PrismaClient({
    log: ['query']
});
app.use(express.json())
app.use(cors())



app.get('/games', async (request, response) => {
    const games = await prisma.game.findMany({
        include:{
           _count:{
            select:{
                ads: true
            }
           }
        }
    })
    
    
    return response.json(games);
});

app.post('/games/:id/ads', async (request, response) => {
    const gameId = request.params.id;
    const body = request.body;
    


    const ad = await prisma.ad.create({
        data:{
            gameId,
            name: body.name,
            yearsPlaying: body.yearsPlaying,
            discord: body.discord,
            weekDays: body.weekDays.join(','),
            hoursStart: convertHourStringToMinute(body.hoursStart),
            hourEnd: convertHourStringToMinute(body.hourEnd),
            useVoiceChannel: body.useVoiceChannel
        }
    })


    return response.status(201).json(ad);
});

app.get('/games/:id/ads', async (request, response) => {
    const gameId = request.params.id;

    const ads = await prisma.ad.findMany({
        select:{
            id: true,
            name: true,
            weekDays: true,
            useVoiceChannel: true,
            yearsPlaying: true,
            hoursStart: true,
            hourEnd: true,
        },
        where: {
            gameId,
        },
        orderBy:{
            createdAt:'desc'
        }
    })
    return response.json(ads.map(ad => {
        return {
            ...ad,
            weekDays: ad.weekDays.split(','),
            hoursStart: convertMinuteToHourString(ad.hoursStart),
            hourEnd: convertMinuteToHourString(ad.hourEnd),
        }
     }));
        

});

app.get('/ads/:id/discord', async (request, response) => {
    const adId = request.params.id;

    const discord = await prisma.ad.findUniqueOrThrow({
       select:{
        discord: true
       },
        where: {
            id: adId,
        }
    })


    return response.json({discord: discord.discord})
});

app.listen(3333);