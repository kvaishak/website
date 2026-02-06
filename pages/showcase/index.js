import React, { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import showcaseStyles from "./index.module.css";
import util from "../../styles/util.module.css";
import PageContainer from "../../HOC/PageContainer";

const Showcase = ({ projects, allTypes, allStatuses }) => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [imageErrors, setImageErrors] = useState({});

  const title = "Showcase";
  const description =
    "A collection of projects and applications I have built across various domains and technologies";

  useEffect(() => {
    if (router.isReady) {
      const { search, type, status } = router.query;
      if (search) setSearchQuery(search);
      if (type) setSelectedType(type);
      if (status) setSelectedStatus(status);
    }
  }, [router.isReady, router.query]);

  const updateURL = (search, type, status) => {
    const query = {};
    if (search) query.search = search;
    if (type) query.type = type;
    if (status) query.status = status;

    router.push(
      {
        pathname: router.pathname,
        query: query,
      },
      undefined,
      { shallow: true }
    );
  };

  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
      const matchesSearch = searchQuery === "" ||
        project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.technologies.some(tech => tech.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesType = selectedType === "" || project.type === selectedType;
      const matchesStatus = selectedStatus === "" || project.status === selectedStatus;

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [projects, searchQuery, selectedType, selectedStatus]);

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedType("");
    setSelectedStatus("");
    router.push(router.pathname, undefined, { shallow: true });
  };

  const handleSearchChange = (value) => {
    setSearchQuery(value);
    updateURL(value, selectedType, selectedStatus);
  };

  const handleTypeChange = (type) => {
    setSelectedType(type);
    updateURL(searchQuery, type, selectedStatus);
  };

  const handleStatusChange = (status) => {
    setSelectedStatus(status);
    updateURL(searchQuery, selectedType, status);
  };

  const handleImageError = (projectId) => {
    setImageErrors(prev => ({ ...prev, [projectId]: true }));
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
              onChange={(e) => handleSearchChange(e.target.value)}
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
                  onClick={() => handleTypeChange("")}
                >
                  All
                </button>
                {allTypes.map((type) => (
                  <button
                    key={type}
                    className={`${showcaseStyles.filterButton} ${
                      selectedType === type ? showcaseStyles.filterButtonActive : ""
                    }`}
                    onClick={() => handleTypeChange(type)}
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
                  onClick={() => handleStatusChange("")}
                >
                  All
                </button>
                {allStatuses.map((status) => (
                  <button
                    key={status}
                    className={`${showcaseStyles.filterButton} ${
                      selectedStatus === status ? showcaseStyles.filterButtonActive : ""
                    }`}
                    onClick={() => handleStatusChange(status)}
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
                  {project.image && !imageErrors[project.id] && (
                    <div className={showcaseStyles.cardImage}>
                      <Image
                        src={project.image}
                        alt={project.title}
                        width={400}
                        height={250}
                        style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                        onError={() => handleImageError(project.id)}
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

export async function getStaticProps() {
  const fs = require('fs');
  const path = require('path');
  
  const filePath = path.join(process.cwd(), 'data', 'projects.json');
  const fileContents = fs.readFileSync(filePath, 'utf8');
  const projects = JSON.parse(fileContents);

  const allTypes = [...new Set(projects.map(p => p.type).filter(Boolean))].sort();
  const allStatuses = [...new Set(projects.map(p => p.status).filter(Boolean))].sort();

  return {
    props: {
      projects,
      allTypes,
      allStatuses,
    },
  };
}

export default Showcase;
