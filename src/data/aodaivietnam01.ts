export const ladies = [
    { src: "/assets/aodaivietnam/collection001/000.jpg" },
    { src: "/assets/aodaivietnam/collection001/001.jpg" },
    { src: "/assets/aodaivietnam/collection001/002.jpg" },
    { src: "/assets/aodaivietnam/collection001/003.jpg" },
    { src: "/assets/aodaivietnam/collection001/004.jpg" },
    { src: "/assets/aodaivietnam/collection001/005.jpg" },
    { src: "/assets/aodaivietnam/collection001/006.jpg" },
    { src: "/assets/aodaivietnam/collection001/007.jpg" },
    { src: "/assets/aodaivietnam/collection001/008.jpg" },
    { src: "/assets/aodaivietnam/collection001/009.jpg" }
].map(({src}) => ({
    src: "http://localhost:4173" + src
}));

export default ladies;