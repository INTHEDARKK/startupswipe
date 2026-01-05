import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET /api/startups - Public, returns all startups
export async function GET() {
  try {
    const startups = await prisma.startup.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        _count: {
          select: { votes: true },
        },
      },
    })

    // Get all votes for all startups in one query
    const allVotes = await prisma.vote.findMany({
      where: {
        startupId: { in: startups.map(s => s.id) }
      }
    })

    // Group votes by startup
    const votesByStartup = new Map<string, typeof allVotes>()
    allVotes.forEach(vote => {
      if (!votesByStartup.has(vote.startupId)) {
        votesByStartup.set(vote.startupId, [])
      }
      votesByStartup.get(vote.startupId)!.push(vote)
    })

    // Calculate confidence from votes
    const startupsWithConfidence = startups.map((startup) => {
      const votes = votesByStartup.get(startup.id) || []
      let confidence = startup.confidence
      
      votes.forEach((vote) => {
        if (vote.vote === "yes") confidence += 2
        else if (vote.vote === "maybe") confidence += 1
        else if (vote.vote === "no") confidence -= 2
        else if (vote.vote === "skip") confidence -= 1
      })

      confidence = Math.max(0, Math.min(100, confidence))

      return {
        id: startup.id,
        name: startup.name,
        pill: startup.pill,
        tag: startup.tag,
        caption: startup.caption || `${startup.tag} demo`,
        desc: startup.description,
        about: startup.about || startup.description,
        confidence,
        yt: startup.ytId,
        website: startup.website || "#",
        social: startup.social || "#",
        userId: startup.userId,
        createdAt: startup.createdAt.toISOString(),
      }
    })

    return NextResponse.json(startupsWithConfidence)
  } catch (error) {
    console.error("Error fetching startups:", error)
    return NextResponse.json(
      { error: "Failed to fetch startups" },
      { status: 500 }
    )
  }
}

// POST /api/startups - Auth required, create new startup
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { name, description, about, ytId, website, social, tag, pill, caption } = body

    if (!name || !description || !ytId) {
      return NextResponse.json(
        { error: "Missing required fields: name, description, ytId" },
        { status: 400 }
      )
    }

    const startup = await prisma.startup.create({
      data: {
        name: name.trim(),
        description: description.trim(),
        about: about?.trim() || description.trim(),
        ytId: ytId.trim(),
        website: website?.trim() || null,
        social: social?.trim() || null,
        tag: tag || "Submitted",
        pill: pill || "Submitted",
        caption: caption || `Submitted by ${session.user.name || "User"}`,
        userId: session.user.id,
        confidence: 50,
      },
    })

    return NextResponse.json({
      id: startup.id,
      name: startup.name,
      pill: startup.pill,
      tag: startup.tag,
      caption: startup.caption,
      desc: startup.description,
      about: startup.about,
      confidence: startup.confidence,
      yt: startup.ytId,
      website: startup.website || "#",
      social: startup.social || "#",
    })
  } catch (error) {
    console.error("Error creating startup:", error)
    return NextResponse.json(
      { error: "Failed to create startup" },
      { status: 500 }
    )
  }
}

