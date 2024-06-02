import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

function generateCentsCurrency(dollars: number) {
  const cents = Math.round(dollars * 100);

  return cents;
}

async function main() {
  // Buat phoneColors, phoneMaterials, dan phoneFinishes
  const phoneColors = await prisma.phoneColor.createManyAndReturn({
    data: [
      {
        name: "Black",
        hex: "#09090b",
      },
      {
        name: "Blue",
        hex: "#172554",
      },
      {
        name: "Rose",
        hex: "#4c0519",
      },
    ],
  });

  const phoneMaterials = await prisma.phoneMaterial.createManyAndReturn({
    data: [
      {
        name: "silicone",
        price: generateCentsCurrency(0),
        description: "",
      },
      {
        name: "polycarbonate",
        price: generateCentsCurrency(5),
        description: "Scratch-resistant coating",
      },
    ],
  });

  const phoneFinishes = await prisma.phoneFinishes.createManyAndReturn({
    data: [
      {
        name: "Smooth",
        price: generateCentsCurrency(0),
        description: "",
      },
      {
        name: "Textured",
        price: generateCentsCurrency(3),
        description: "Soft grippy texture",
      },
    ],
  });

  // Buat phoneModels
  const phoneModels = await prisma.phoneModel.createManyAndReturn({
    data: [
      {
        name: "IphoneX",
        url: "/assets/images/phones/iphonex.png",
        price: generateCentsCurrency(14),
      },
      {
        name: "Iphone11",
        url: "/assets/images/phones/iphone11.png",
        price: generateCentsCurrency(14.4),
      },
      {
        name: "Iphone12",
        url: "/assets/images/phones/iphone12.png",
        price: generateCentsCurrency(14.5),
      },
      {
        name: "Iphone13",
        url: "/assets/images/phones/iphone13.png",
        price: generateCentsCurrency(16),
      },
    ],
  });

  // Hubungkan phoneModels dengan phoneColors, phoneMaterials, dan phoneFinishes
  const connectPromises: any[] = [];

  phoneModels.forEach((model) => {
    connectPromises.push(
      prisma.phoneModel.update({
        where: { id: model.id },
        data: {
          phoneColors: {
            connect: phoneColors.map((color) => ({ id: color.id })),
          },
          phoneMaterials: {
            connect: phoneMaterials.map((material) => ({ id: material.id })),
          },
          phoneFinishes: {
            connect: phoneFinishes.map((finish) => ({ id: finish.id })),
          },
        },
      })
    );
  });

  await Promise.all(connectPromises);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
