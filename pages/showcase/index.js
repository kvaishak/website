import React, { useState, useMemo } from "react";
import Image from "next/image";
import showcaseStyles from "./index.module.css";
import util from "../../styles/util.module.css";
import PageContainer from "../../HOC/PageContainer";
import projectsData from "../../data/projects.json";

const Showcase = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  const title = "Showcase";
  const description =
    "A collection of projects and applications I have built across various domains and technologies";

  const allTypes = useMemo(() => {
    const types = new Set();
    projectsData.forEach(project => {
      if (project.type) types.add(project.type);
    });
    return Array.from(types).sort();
  }, []);

  const allStatuses = useMemo(() => {
    const statuses = new Set();
    projectsData.forEach(project => {
      if (project.status) statuses.add(project.status);
    });
    return Array.from(statuses).sort();
  }, []);

  const filteredProjects = useMemo(() => {
    return projectsData.filter(project => {
      const matchesSearch = searchQuery === "" ||
        project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.technologies.some(tech => tech.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesType = selectedType === "" || project.type === selectedType;
      const matchesStatus = selectedStatus === "" || project.status === selectedStatus;

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [searchQuery, selectedType, selectedStatus]);

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedType("");
    setSelectedStatus("");
  };

  return (
    <PageContainer title={title} description={description} clientOnly={true}>
      <main className={util.main}>
        <div className={util.title}>
          <h1>{title}</h1>
        </div>

        <div className={showcaseStyles.container}>
          <div className={showcaseStyles.gap}>&nbsp;</div>
          <p>{description}</p>
          <div className={showcaseStyles.gap}>&nbsp;</div>

          <div className={showcaseStyles.searchContainer}>
            <input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={showcaseStyles.searchInput}
            />
          </div>

          <div className={showcaseStyles.filterContainer}>
            {allTypes.length > 0 && (
              <div className={showcaseStyles.filterGroup}>
                <span className={showcaseStyles.filterLabel}>Type:</span>
                <button
                  className={`${showcaseStyles.filterButton} ${
                    selectedType === "" ? showcaseStyles.filterButtonActive : ""
                  }`}
                  onClick={() => setSelectedType("")}
                >
                  All
                </button>
                {allTypes.map((type) => (
                  <button
                    key={type}
                    className={`${showcaseStyles.filterButton} ${
                      selectedType === type ? showcaseStyles.filterButtonActive : ""
                    }`}
                    onClick={() => setSelectedType(type)}
                  >
                    {type}
                  </button>
                ))}
              </div>
            )}

            {allStatuses.length > 0 && (
              <div className={showcaseStyles.filterGroup}>
                <span className={showcaseStyles.filterLabel}>Status:</span>
                <button
                  className={`${showcaseStyles.filterButton} ${
                    selectedStatus === "" ? showcaseStyles.filterButtonActive : ""
                  }`}
                  onClick={() => setSelectedStatus("")}
                >
                  All
                </button>
                {allStatuses.map((status) => (
                  <button
                    key={status}
                    className={`${showcaseStyles.filterButton} ${
                      selectedStatus === status ? showcaseStyles.filterButtonActive : ""
                    }`}
                    onClick={() => setSelectedStatus(status)}
                  >
                    {status}
                  </button>
                ))}
              </div>
            )}
          </div>

          {filteredProjects.length === 0 ? (
            <div className={showcaseStyles.noResults}>
              <p>No projects found matching your criteria.</p>
              <button onClick={resetFilters} className={showcaseStyles.resetButton}>
                Reset filters
              </button>
            </div>
          ) : (
            <div className={showcaseStyles.grid}>
              {filteredProjects.map((project) => (
                <a
                  key={project.id}
                  href={project.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={showcaseStyles.card}
                >
                  {project.image && (
                    <div className={showcaseStyles.cardImage}>
                      <Image
                        src={project.image}
                        alt={project.title}
                        width={400}
                        height={250}
                        style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                      />
                    </div>
                  )}
                  <div className={showcaseStyles.cardContent}>
                    <div className={showcaseStyles.cardHeader}>
                      <h3 className={showcaseStyles.cardTitle}>{project.title}</h3>
                      {project.status && (
                        <span className={`${showcaseStyles.statusBadge} ${showcaseStyles['status-' + project.status]}`}>
                          {project.status}
                        </span>
                      )}
                    </div>
                    <p className={showcaseStyles.cardDescription}>{project.description}</p>
                    {project.technologies && project.technologies.length > 0 && (
                      <div className={showcaseStyles.techTags}>
                        {project.technologies.map((tech, index) => (
                          <span key={index} className={showcaseStyles.techTag}>
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      </main>
    </PageContainer>
  );
};

export default Showcase;
