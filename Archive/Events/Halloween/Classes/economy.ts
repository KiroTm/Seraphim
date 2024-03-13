import { AllAnimals } from "./types";

export class EconomyClass {
  public getRandomAnimal() {
    const animalsArray = Object.values(AllAnimals);

    const totalWeight = animalsArray.reduce((acc, animal) => acc + animal.weight, 0);
    const randomWeight = Math.random() * totalWeight;

    let currentWeight = 0;

    const randomAnimal = animalsArray.find(animal => {
      currentWeight += animal.weight;
      return randomWeight <= currentWeight;
    });

    return randomAnimal
  }

  public getRandomEconomyReply(outcome: 'success' | 'fail'): string {
    const successResponses: string[] = [
      `You successfully hunted {animal}!`,
      `Nice job! You caught {animal}.`,
      `You managed to hunt down {animal}.`,
      `You've bagged {animal}!`,
      `Impressive! You've got {animal}.`,
      `{animal} is now in your possession!`,
      `You've added {animal} to your collection!`,
      `Your hunting skills paid off with a {animal}.`,
      `Well done! You've secured a {animal}.`,
      `The {animal} is now under your control.`,
      `Congratulations! You've acquired {animal}.`,
      `You've successfully brought home {animal}.`,
      `You've captured a {animal} in your hunt.`,
      `Your persistence rewarded you with {animal}.`,
      `{animal} is now part of your inventory.`,
      `You've earned {animal} from your efforts.`,
      `Your hard work paid off with {animal}.`,
      `Well played! You've added {animal}.`,
      `You've gained {animal} in your hunt.`,
      `{animal} is now in your hands.`,
    ];
  
    const failResponses: string[] = [
      `The {animal} got away.`,
      `You missed the {animal}.`,
      `Better luck next time with the {animal}.`,
      `The {animal} slipped through your fingers.`,
      `The {animal} evaded capture this time.`,
      `The {animal} proved too quick for you.`,
      `You didn't find any {animal} this time.`,
      `No luck with the {animal} this time.`,
      `No sign of the {animal} this round.`,
      `The {animal} managed to escape your grasp.`,
      `The {animal} disappeared before you could catch it.`,
      `The {animal} outsmarted you and got away.`,
      `You couldn't get a hold of the {animal} this time.`,
      `The {animal} is too sneaky for you.`,
      `The {animal} gave you the slip.`,
      `Your hunt for the {animal} was unsuccessful.`,
      `The {animal} remained hidden from you.`,
      `The {animal} was too quick for you to catch.`,
      `You'll have to try again to get the {animal}.`,
    ];
  
    function pickRandom<T>(array: Array<T>) {
      const arr = [...array];
      return arr[Math.floor(Math.random() * arr.length)];
    }
    return pickRandom(outcome == 'fail' ? failResponses : successResponses)
  }
  

}
