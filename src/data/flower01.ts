export const ladies = [
    { src: "/assets/flower01/001.jpg" },
    { src: "/assets/flower01/002.jpg" },
    { src: "/assets/flower01/003.jpg" },
    { src: "/assets/flower01/004.jpg" },
    { src: "/assets/flower01/005.jpg" },
    { src: "/assets/flower01/006.jpg" },
].map(({src}) => ({
    src: "https://192.168.0.210:4173" + src
}));

export default ladies;