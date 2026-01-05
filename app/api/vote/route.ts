import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// POST /api/vote - Public (but tracks user if logged in)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { startupId, vote } = body

    if (!startupId || !vote) {
      return NextResponse.json(
        { error: "Missing startupId or vote" },
        { status: 400 }
      )
    }

    if (!["yes", "maybe", "no", "skip"].includes(vote)) {
      return NextResponse.json(
        { error: "Invalid vote. Must be: yes, maybe, no, or skip" },
        { status: 400 }
      )
    }

    const session = await getServerSession(authOptions)
    const userId = session?.user?.id || null

    // Check if startup exists
    const startup = await prisma.startup.findUnique({
      where: { id: startupId },
    })

    if (!startup) {
      return NextResponse.json(
        { error: "Startup not found" },
        { status: 404 }
      )
    }

    // Create vote
    await prisma.vote.create({
      data: {
        startupId,
        userId,
        vote,
      },
    })

    // Recalculate confidence
    const votes = await prisma.vote.findMany({
      where: { startupId },
    })

    let confidence = startup.confidence
    votes.forEach((v) => {
      if (v.vote === "yes") confidence += 2
      else if (v.vote === "maybe") confidence += 1
      else if (v.vote === "no") confidence -= 2
      else if (v.vote === "skip") confidence -= 1
    })

    confidence = Math.max(0, Math.min(100, confidence))

    // Update startup confidence
    await prisma.startup.update({
      where: { id: startupId },
      data: { confidence },
    })

    return NextResponse.json({ success: true, confidence })
  } catch (error) {
    console.error("Error voting:", error)
    return NextResponse.json(
      { error: "Failed to submit vote" },
      { status: 500 }
    )
  }
}

