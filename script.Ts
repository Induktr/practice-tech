const MNData = {
  countNodes: 10,
  toString: (content: string = "Nikita", coor: { x: number, y: number } = {x: 10,y: 20}) => {
    return content;
  },
  propertyIsEnumerable: () => {
    return false;
  }
};
