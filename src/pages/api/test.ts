import prisma from '@/server/prisma';

export const GET = async () => {
  const data = await prisma.arbitraryData.findMany();

  return new Response(JSON.stringify({ hello: "world", data }));
};
