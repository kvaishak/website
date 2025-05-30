import styles from "./travels.module.css";
import {
  Inset,
  Box,
  Text,
  Strong,
  Card,
  Flex,
  Container,
  Section,
} from "@radix-ui/themes";

// Utility function to format date range
const formatDateRange = (dateRange) => {
  return dateRange.replace(
    /(\w+)\s(\d+)\s-\s(\w+)\s(\d+),\s\d{4}/,
    (match, startMonth, startDay, endMonth, endDay) => {
      const shortStartMonth = startMonth.slice(0, 3);
      const shortEndMonth = endMonth.slice(0, 3);
      return `${shortStartMonth} ${startDay} - ${shortEndMonth} ${endDay}`;
    }
  );
};

const TravelHome = ({ travelsData }) => {
  // Organize travels by year in descending order
  const sortedTravels = travelsData.sort((a, b) => b.year - a.year);

  // Group travels by year
  const travelsByYear = sortedTravels.reduce((acc, travel) => {
    if (!acc[travel.year]) {
      acc[travel.year] = [];
    }
    acc[travel.year].push(travel);
    return acc;
  }, {});

  console.log(travelsByYear);

  return (
    <div className={styles.container}>
      {Object.keys(travelsByYear)
        .sort((a, b) => b - a) // Sort years in descending order
        .map((year) => (
          <Container key={year} size="4" top="1rem" mt="20px">
            <h2 className={styles.yearTitle}>{year}</h2>
            <Flex direction="row" gap={"1rem"}>
              {travelsByYear[year].map((tripData) => (
                <Box
                  key={tripData.id}
                  maxWidth="340px"
                  style={{
                    borderColor: "var(--gray-7)",
                    borderWidth: "1px",
                    borderStyle: "solid",
                    borderRadius: "8px",
                  }}
                >
                  <Card>
                    <Flex gap="3" align="center" direction={"row"}>
                      <Inset clip="padding-box" side="left" pb="current">
                        <img
                          src={tripData.cover}
                          alt={tripData.title}
                          style={{
                            display: "block",
                            objectFit: "cover",
                            width: "100%",
                            height: 140,
                            backgroundColor: "var(--gray-5)",
                            borderRadius: "11px",
                          }}
                        />
                      </Inset>
                      <Box ml={"1rem"}>
                        <Text as="div" size="6" weight="bold">
                          {tripData.title}
                        </Text>
                        <Text as="div" size="2" color="cyan">
                          {tripData.location}
                        </Text>
                        <Text as="div" size="1" color="gray">
                          {formatDateRange(tripData.date)}
                        </Text>
                      </Box>
                    </Flex>
                  </Card>
                </Box>
              ))}
            </Flex>
          </Container>
        ))}
    </div>
  );
};

export default TravelHome;

{
  /* <Box maxWidth="240px">
	<Card size="2">
		<Inset clip="padding-box" side="top" pb="current">
			<img
				src="https://images.unsplash.com/photo-1617050318658-a9a3175e34cb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80"
				alt="Bold typography"
				style={{
					display: "block",
					objectFit: "cover",
					width: "100%",
					height: 140,
					backgroundColor: "var(--gray-5)",
				}}
			/>
		</Inset>
		<Text as="p" size="3">
			<Strong>Typography</Strong> is the art and technique of arranging type to
			make written language legible, readable and appealing when displayed.
		</Text>
	</Card>
</Box> */

  {
    /* <h3 className={styles.travelTitle}>{tripData.title}</h3>
                <p className={styles.travelLocation}>{tripData.location}</p>
                <p className={styles.travelDate}>{tripData.date}</p> */
  }
}

{
  /* <Box maxWidth="240px">
  <Card>
    <Flex gap="3" align="center">
      <Avatar
        size="3"
        src="https://images.unsplash.com/photo-1607346256330-dee7af15f7c5?&w=64&h=64&dpr=2&q=70&crop=focalpoint&fp-x=0.67&fp-y=0.5&fp-z=1.4&fit=crop"
        radius="full"
        fallback="T"
      />
      <Box>
        <Text as="div" size="2" weight="bold">
          Teodros Girmay
        </Text>
        <Text as="div" size="2" color="gray">
          Engineering
        </Text>
      </Box>
    </Flex>
  </Card>
</Box>; */
}
